# Provider Integration Notes

These notes capture the patterns and conventions used in this repo so new providers can be added consistently.

## Where provider logic lives

- `providers/*.js` contains provider detection and IPv6 generation helpers.
- `app.js` wires providers into AAAA and A record flows.
- `tests/*.js` contains simple Node assertions for provider utilities.

## Common integration pattern

1. Add a provider module:
   - Export functions for hostname detection and/or IP range detection.
   - Export helpers to map IPv4 -> IPv6 when required.
2. Wire AAAA flow in `app.js`:
   - Add `require('./providers/<name>')`.
   - Add a `case '<name>'` in the `add_aaaa` provider switch to force a match.
   - Add a hostname check like `if (!prov) prov = provider.check_for_<name>_hostname(last_hostname);`.
   - Resolve IPv6 addresses or generate them, then call `handleResponse(...)`.
3. Wire A flow in `app.js`:
   - Add IP range checks inside the A-record branch.
   - When matched, set `add_aaaa[qhostname]` to either the provider name (for AAAA follow-up)
     or to a generated IPv6 address for direct synthesis.
4. Add tests in `tests/<name>.js` using `assert`.

## Notes on code style

- Keep provider modules small and focused.
- Use `ip-range-check` for IPv4 CIDR matches.
- Return `false` for non-matches.
- Avoid non-ASCII unless the file already uses it.
