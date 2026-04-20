use anchor_lang::prelude::*;
use anchor_lang::solana_program::ed25519_program::ID as ED25519_ID;
use anchor_lang::solana_program::sysvar::instructions::{
    load_current_index_checked, load_instruction_at_checked,
};

declare_id!("Bcn11111111111111111111111111111111111111");

const SCHEMA_SEED: &[u8] = b"schema";
const ATTESTATION_SEED: &[u8] = b"attestation";
const VERIFIER_SEED: &[u8] = b"verifier";
const MAX_SCHEMA_NAME: usize = 64;
const MAX_SCHEMA_URI: usize = 256;
const MAX_PAYLOAD: usize = 512;

#[program]
pub mod beacon {
    use super::*;

    pub fn register_schema(
        ctx: Context<RegisterSchema>,
        schema_id: [u8; 32],
        name: String,
        uri: String,
        revocable: bool,
    ) -> Result<()> {
        require!(name.len() <= MAX_SCHEMA_NAME, BeaconError::NameTooLong);
        require!(uri.len() <= MAX_SCHEMA_URI, BeaconError::UriTooLong);

        let schema = &mut ctx.accounts.schema;
        schema.authority = ctx.accounts.authority.key();
        schema.schema_id = schema_id;
        schema.name = name;
        schema.uri = uri;
        schema.revocable = revocable;
        schema.issued_count = 0;
        schema.revoked_count = 0;
        schema.created_at = Clock::get()?.unix_timestamp;
        schema.bump = ctx.bumps.schema;

        emit!(SchemaRegistered {
            schema: schema.key(),
            authority: schema.authority,
            schema_id,
            revocable,
        });
        Ok(())
    }

    pub fn issue_attestation(
        ctx: Context<IssueAttestation>,
        subject: Pubkey,
        payload_hash: [u8; 32],
        expires_at: i64,
        payload: Vec<u8>,
    ) -> Result<()> {
        require!(payload.len() <= MAX_PAYLOAD, BeaconError::PayloadTooLarge);
        require!(
            expires_at == 0 || expires_at > Clock::get()?.unix_timestamp,
            BeaconError::AlreadyExpired
        );

        let ix_sysvar = &ctx.accounts.instructions_sysvar;
        verify_ed25519_signed(ix_sysvar, &ctx.accounts.issuer.key(), &payload_hash)?;

        let schema = &mut ctx.accounts.schema;
        let attestation = &mut ctx.accounts.attestation;

        attestation.schema = schema.key();
        attestation.issuer = ctx.accounts.issuer.key();
        attestation.subject = subject;
        attestation.payload_hash = payload_hash;
        attestation.payload = payload;
        attestation.issued_at = Clock::get()?.unix_timestamp;
        attestation.expires_at = expires_at;
        attestation.revoked_at = 0;
        attestation.bump = ctx.bumps.attestation;

        schema.issued_count = schema
            .issued_count
            .checked_add(1)
            .ok_or(BeaconError::MathOverflow)?;

        let verifier = &mut ctx.accounts.verifier_score;
        if verifier.issuer == Pubkey::default() {
            verifier.issuer = ctx.accounts.issuer.key();
            verifier.bump = ctx.bumps.verifier_score;
        }
        verifier.issued = verifier
            .issued
            .checked_add(1)
            .ok_or(BeaconError::MathOverflow)?;
        verifier.reputation = compute_reputation(verifier.issued, verifier.revoked);

        emit!(AttestationIssued {
            attestation: attestation.key(),
            schema: schema.key(),
            issuer: attestation.issuer,
            subject,
            payload_hash,
            expires_at,
        });
        Ok(())
    }

    pub fn revoke_attestation(ctx: Context<RevokeAttestation>) -> Result<()> {
        let schema = &mut ctx.accounts.schema;
        let attestation = &mut ctx.accounts.attestation;

        require!(schema.revocable, BeaconError::NotRevocable);
        require_keys_eq!(
            attestation.issuer,
            ctx.accounts.issuer.key(),
            BeaconError::NotIssuer
        );
        require!(attestation.revoked_at == 0, BeaconError::AlreadyRevoked);

        attestation.revoked_at = Clock::get()?.unix_timestamp;
        schema.revoked_count = schema
            .revoked_count
            .checked_add(1)
            .ok_or(BeaconError::MathOverflow)?;

        let verifier = &mut ctx.accounts.verifier_score;
        verifier.revoked = verifier
            .revoked
            .checked_add(1)
            .ok_or(BeaconError::MathOverflow)?;
        verifier.reputation = compute_reputation(verifier.issued, verifier.revoked);

        emit!(AttestationRevoked {
            attestation: attestation.key(),
            schema: schema.key(),
            issuer: attestation.issuer,
            revoked_at: attestation.revoked_at,
        });
        Ok(())
    }

    pub fn touch_verifier(ctx: Context<TouchVerifier>) -> Result<()> {
        let v = &mut ctx.accounts.verifier_score;
        if v.issuer == Pubkey::default() {
            v.issuer = ctx.accounts.issuer.key();
            v.bump = ctx.bumps.verifier_score;
        }
        v.last_touched = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

fn compute_reputation(issued: u64, revoked: u64) -> u32 {
    if issued == 0 {
        return 0;
    }
    let retained = issued.saturating_sub(revoked) as u128;
    let score = retained
        .saturating_mul(10_000)
        .saturating_div(issued as u128);
    score.min(10_000) as u32
}

fn verify_ed25519_signed(
    ix_sysvar: &AccountInfo,
    expected_signer: &Pubkey,
    expected_message: &[u8; 32],
) -> Result<()> {
    let current_ix_index = load_current_index_checked(ix_sysvar)? as usize;
    require!(current_ix_index > 0, BeaconError::MissingSignatureIx);

    let sig_ix = load_instruction_at_checked(current_ix_index - 1, ix_sysvar)?;
    require_keys_eq!(sig_ix.program_id, ED25519_ID, BeaconError::BadSignatureIx);

    let data = sig_ix.data;
    require!(data.len() >= 16, BeaconError::BadSignatureIx);

    let num_signatures = data[0];
    require!(num_signatures == 1, BeaconError::BadSignatureIx);

    let public_key_offset = u16::from_le_bytes([data[6], data[7]]) as usize;
    let message_offset = u16::from_le_bytes([data[10], data[11]]) as usize;
    let message_size = u16::from_le_bytes([data[12], data[13]]) as usize;

    require!(
        data.len() >= public_key_offset + 32,
        BeaconError::BadSignatureIx
    );
    require!(
        data.len() >= message_offset + message_size,
        BeaconError::BadSignatureIx
    );
    require!(message_size == 32, BeaconError::BadSignatureIx);

    let pubkey_bytes = &data[public_key_offset..public_key_offset + 32];
    let message_bytes = &data[message_offset..message_offset + message_size];

    require!(
        pubkey_bytes == expected_signer.to_bytes(),
        BeaconError::SignerMismatch
    );
    require!(
        message_bytes == expected_message,
        BeaconError::MessageMismatch
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(schema_id: [u8; 32], name: String, uri: String)]
pub struct RegisterSchema<'info> {
    #[account(
        init,
        payer = authority,
        space = Schema::SIZE,
        seeds = [SCHEMA_SEED, authority.key().as_ref(), &schema_id],
        bump
    )]
    pub schema: Account<'info, Schema>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(subject: Pubkey, payload_hash: [u8; 32])]
pub struct IssueAttestation<'info> {
    #[account(
        mut,
        seeds = [SCHEMA_SEED, schema.authority.as_ref(), &schema.schema_id],
        bump = schema.bump
    )]
    pub schema: Account<'info, Schema>,
    #[account(
        init,
        payer = issuer,
        space = Attestation::SIZE,
        seeds = [
            ATTESTATION_SEED,
            schema.key().as_ref(),
            issuer.key().as_ref(),
            subject.as_ref(),
            &payload_hash
        ],
        bump
    )]
    pub attestation: Account<'info, Attestation>,
    #[account(
        init_if_needed,
        payer = issuer,
        space = VerifierScore::SIZE,
        seeds = [VERIFIER_SEED, issuer.key().as_ref()],
        bump
    )]
    pub verifier_score: Account<'info, VerifierScore>,
    #[account(mut)]
    pub issuer: Signer<'info>,
    /// CHECK: instructions sysvar verified by address
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeAttestation<'info> {
    #[account(
        mut,
        seeds = [SCHEMA_SEED, schema.authority.as_ref(), &schema.schema_id],
        bump = schema.bump
    )]
    pub schema: Account<'info, Schema>,
    #[account(mut)]
    pub attestation: Account<'info, Attestation>,
    #[account(
        mut,
        seeds = [VERIFIER_SEED, issuer.key().as_ref()],
        bump = verifier_score.bump
    )]
    pub verifier_score: Account<'info, VerifierScore>,
    #[account(mut)]
    pub issuer: Signer<'info>,
}

#[derive(Accounts)]
pub struct TouchVerifier<'info> {
    #[account(
        init_if_needed,
        payer = issuer,
        space = VerifierScore::SIZE,
        seeds = [VERIFIER_SEED, issuer.key().as_ref()],
        bump
    )]
    pub verifier_score: Account<'info, VerifierScore>,
    #[account(mut)]
    pub issuer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Schema {
    pub authority: Pubkey,
    pub schema_id: [u8; 32],
    pub name: String,
    pub uri: String,
    pub revocable: bool,
    pub issued_count: u64,
    pub revoked_count: u64,
    pub created_at: i64,
    pub bump: u8,
}

impl Schema {
    pub const SIZE: usize =
        8 + 32 + 32 + (4 + MAX_SCHEMA_NAME) + (4 + MAX_SCHEMA_URI) + 1 + 8 + 8 + 8 + 1;
}

#[account]
pub struct Attestation {
    pub schema: Pubkey,
    pub issuer: Pubkey,
    pub subject: Pubkey,
    pub payload_hash: [u8; 32],
    pub payload: Vec<u8>,
    pub issued_at: i64,
    pub expires_at: i64,
    pub revoked_at: i64,
    pub bump: u8,
}

impl Attestation {
    pub const SIZE: usize =
        8 + 32 + 32 + 32 + 32 + (4 + MAX_PAYLOAD) + 8 + 8 + 8 + 1;
}

#[account]
pub struct VerifierScore {
    pub issuer: Pubkey,
    pub issued: u64,
    pub revoked: u64,
    pub reputation: u32,
    pub last_touched: i64,
    pub bump: u8,
}

impl VerifierScore {
    pub const SIZE: usize = 8 + 32 + 8 + 8 + 4 + 8 + 1;
}

#[event]
pub struct SchemaRegistered {
    pub schema: Pubkey,
    pub authority: Pubkey,
    pub schema_id: [u8; 32],
    pub revocable: bool,
}

#[event]
pub struct AttestationIssued {
    pub attestation: Pubkey,
    pub schema: Pubkey,
    pub issuer: Pubkey,
    pub subject: Pubkey,
    pub payload_hash: [u8; 32],
    pub expires_at: i64,
}

#[event]
pub struct AttestationRevoked {
    pub attestation: Pubkey,
    pub schema: Pubkey,
    pub issuer: Pubkey,
    pub revoked_at: i64,
}

#[error_code]
pub enum BeaconError {
    #[msg("Schema name exceeds 64 characters")]
    NameTooLong,
    #[msg("Schema URI exceeds 256 characters")]
    UriTooLong,
    #[msg("Payload exceeds 512 bytes")]
    PayloadTooLarge,
    #[msg("Expiration must be in the future")]
    AlreadyExpired,
    #[msg("Schema is not revocable")]
    NotRevocable,
    #[msg("Only the original issuer can revoke")]
    NotIssuer,
    #[msg("Attestation has already been revoked")]
    AlreadyRevoked,
    #[msg("Numeric overflow")]
    MathOverflow,
    #[msg("Missing preceding ed25519 signature instruction")]
    MissingSignatureIx,
    #[msg("Preceding instruction is not a valid ed25519 instruction")]
    BadSignatureIx,
    #[msg("Ed25519 signer does not match issuer")]
    SignerMismatch,
    #[msg("Signed message does not match payload hash")]
    MessageMismatch,
}
