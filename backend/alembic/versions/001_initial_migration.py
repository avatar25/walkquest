"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('display_name', sa.String(), nullable=True),
        sa.Column('avatar_url', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('user_id')
    )
    
    # Create quests table
    op.create_table('quests',
        sa.Column('quest_id', sa.String(), nullable=False),
        sa.Column('kind', sa.String(), nullable=False),
        sa.Column('center_lat', sa.Float(), nullable=False),
        sa.Column('center_lng', sa.Float(), nullable=False),
        sa.Column('radius_m', sa.Integer(), nullable=False),
        sa.Column('hint', sa.String(), nullable=True),
        sa.Column('reward_points', sa.Integer(), nullable=False),
        sa.Column('active_from', sa.DateTime(timezone=True), nullable=False),
        sa.Column('active_to', sa.DateTime(timezone=True), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('quest_id')
    )
    
    # Create proofs table
    op.create_table('proofs',
        sa.Column('proof_id', sa.String(), nullable=False),
        sa.Column('quest_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('exif_ts', sa.DateTime(timezone=True), nullable=False),
        sa.Column('image_url', sa.String(), nullable=False),
        sa.Column('device_attestation', sa.String(), nullable=True),
        sa.Column('state', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['quest_id'], ['quests.quest_id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
        sa.PrimaryKeyConstraint('proof_id')
    )
    
    # Create verifications table
    op.create_table('verifications',
        sa.Column('proof_id', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('reasons', sa.JSON(), nullable=False),
        sa.Column('score_awarded', sa.Integer(), nullable=False),
        sa.Column('vps_quality', sa.String(), nullable=True),
        sa.Column('heading_delta_deg', sa.Float(), nullable=True),
        sa.Column('gps_distance_m', sa.Float(), nullable=True),
        sa.Column('vision_notes', sa.String(), nullable=True),
        sa.Column('processed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['proof_id'], ['proofs.proof_id'], ),
        sa.PrimaryKeyConstraint('proof_id')
    )
    
    # Create indexes
    op.create_index('idx_quests_active', 'quests', ['active_from', 'active_to'])
    op.create_index('idx_proofs_user', 'proofs', ['user_id', 'created_at'])


def downgrade() -> None:
    op.drop_index('idx_proofs_user', table_name='proofs')
    op.drop_index('idx_quests_active', table_name='quests')
    op.drop_table('verifications')
    op.drop_table('proofs')
    op.drop_table('quests')
    op.drop_table('users')
