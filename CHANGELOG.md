# Changelog

## v2.1.0 (2025-08-29)

### Features

- Add `encode(bytes)` and `decode(puid)` methods on the Puid generator to encode/decode using the generator's configured characters.

- Add `risk(total)` and `total(risk)` methods on the Puid generator to approximate the risk/total for the generator using conservative approximations of actual entropy capacity.

### Types/Tests

- Extend Puid type with encode and decode methods
- Extend Puid type with risk and total methods

### Changes

The calculations using `bits`, `risk` and `total` drop the minor efficiency for small totals. When using `total < 1000` this may create a slightly different corresponding value for a calculation given any two of the three values, but does not effect core `puid` generation.

## v2.0.0 (2025-08-27)

### Breaking

- Raise Node.js engines requirement to >=18
- Introduce exports map and ESM/browser export conditions; deep imports may break depending on consumers' bundlers/resolvers

### Features

- New browser-friendly entry point (`import { puid } from 'puid-js/web'`)
- Add `generate(config?)` convenience function

### Fixes

- Browser-safe ERE computation via new `byteLength` helper (uses TextEncoder in browsers)
- Correct ESM `.mjs` and browser export conditions

### Performance

- Reduce allocations on the power-of-two path in `bits` by replacing map with a preallocated loop
- Cache `bitShifts` per charset to avoid recomputation

### Refactor/Types

- Narrow `EntropyFunction` to a discriminated union and remove casts in `fillEntropy`
- Improve Web Crypto detection and binding
- Freeze `puid.info` for safer consumption

### Build/Tooling/Docs

- Pin Yarn 4.9.4 and add CI/release workflows
- Raise TypeScript targets, enable strict typing, add subpath exports and npm metadata
- Add tinybench micro-benchmark and Node ESM consumer example
- Documentation: add "Migrating from UUID v4" section

## v1.3.1 (2023-08-11)

### Fixes

- Encoders for char sets added in 1.3.0 were defaulting to the basic custom chars encoder rather than optimized versions.

## v1.3.0 (2023-08-10)

### Fixes

- Further optimize bit shifts
- Change order of Base32 characters to match RFC 4648

### Additions

- Add more PUID cross-repo data tests
- Add predefined characters
  - Base16 from RFC 4648
  - Crockford32
  - WordSafe32

Note: Base16 chars are the same as HexUpper. If HexUpper chars are used, Puid info will report the name as `base16`.

### Changes

- Reject chars with ASCII range code point between tilde and inverted bang
- Reject unicode chars with code point beyond 0xFFFF
- Bound all encoders to report NaN if called to encode an number outside the range of specified characters. The `encode` call is meant to be internal and this change should not affect external code.

### Cleanup

- General code cleanup

## v1.2.0 (2022-08-08)

### Fixes

- Selection of bit shift. This effected the histogram of some characters sets.

### Changes

- Reordered alphanum lower and upper characters (digit last to match other PUID libraries)

### Added

- Tests for AlphaNumLower & AlphaNumUpper
- Cross puid repo data submodule
- Test of cross puid data. This functions as puid histogram testing since cross repo data has been validated using chi-square tests.

## v1.1.0 (2022-07-28)

### Fixes

- Chars.SafeAscii encoder

### Changes

- Simplified bit shift calc
- Reordered alphanum lower and upper characters (digit are first)
- Optimized sliced values to puid string processing

### Added

- Chars.Symbol and encoder
- Encoders for Chars.AlphanumLower and Chars.AlphanumUpper

### Testing

- Test for above fixes, changes and additions

### Documentation

- Update README

## v1.0.2 (2022-07-15)

### Documentation

- Update npm package keywords

## v1.0.1 (2022-07-15)

### Fix

- Remove spurious dependency on @bitauth/libauth

## v1.0.0 (2022-07-08)

Initial release
