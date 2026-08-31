-- Upgrades user_ai_settings from one-row-per-user to one-row-per-(user, provider),
-- and adds is_active to track which provider is currently in use.
-- Safe to run even if user_ai_settings already exists from the earlier single-provider migration.

alter table user_ai_settings drop constraint if exists user_ai_settings_user_id_key;

alter table user_ai_settings add column if not exists is_active boolean not null default false;

alter table user_ai_settings add constraint user_ai_settings_user_id_provider_key unique (user_id, provider);

update user_ai_settings set is_active = true where is_active = false;
