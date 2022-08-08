# Changelog

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
