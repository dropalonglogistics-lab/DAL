INSERT INTO platform_config (key, value)
VALUES ('show_route_map', 'true')
ON CONFLICT (key) DO NOTHING;
