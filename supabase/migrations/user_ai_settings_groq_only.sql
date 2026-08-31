-- Reverts user_ai_settings from multi-provider back to a single Groq-only
-- BYOK key per user, per the decision to drop multi-provider support
-- (it caused invalid/deprecated model IDs and account-quota errors across
-- providers we don't control). Safe to run even if some of these objects
-- don't exist yet.

delete from user_ai_settings where provider is distinct from 'groq';

alter table user_ai_settings drop constraint if exists user_ai_settings_user_id_provider_key;

alter table user_ai_settings add constraint user_ai_settings_user_id_key unique (user_id);

update user_ai_settings set provider = 'groq', model = 'qwen/qwen3.6-27b', is_active = true;
