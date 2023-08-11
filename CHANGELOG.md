# Changelog

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
