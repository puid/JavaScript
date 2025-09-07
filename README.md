# puid-js

Simple, flexible and efficient generation of probably unique identifiers (`puid`, aka random strings) of intuitively specified entropy using pre-defined or custom characters (including Unicode).

```js
const { Chars, puid } = require('puid-js')

const { generator: randId } = puid({ chars: Chars.Alpha, total: 1e5, risk: 1e12 })
randId()
// => 'qZrxxBnmKndIn'
```

[![npm version](https://img.shields.io/npm/v/puid-js)](https://www.npmjs.com/package/puid-js) &nbsp; ![npm bundle size](https://img.shields.io/bundlephobia/min/puid-js) &nbsp; ![NPM](https://img.shields.io/npm/l/puid-js)

## <a name="TOC"></a>TOC

- [Overview](#Overview)
  - [Usage](#Usage)
  - [Installation](#Installation)
  - [API](#API)
  - [Chars](#Chars)
- [Motivation](#Motivation)
  - [What is a random string?](#WhatIsARandomString)
  - [How random is a random string?](#RandomStringEntropy)
  - [Uniqueness](#Uniqueness)
  - [ID randomness](#IDRandomness)
  - [Efficiency](#Efficiency)
  - [Overkill and Under Specify](#Overkill)
- [Efficiencies](#Efficiencies)
- [tl;dr](#tl;dr)
- [Migrating from UUID v4](#UUIDv4Migration)

## <a name="Overview"></a>Overview

`puid-js` provides intuitive and efficient generation of random IDs. For the purposes of `puid-js`, a random ID is considered a random string used in a context of uniqueness, that is, random IDs are a bunch of random strings that are hopefully unique.

Random string generation can be thought of as a _transformation_ of some random source of entropy into a string _representation_ of randomness. A general purpose random string library used for random IDs should therefore provide user specification for each of the following three key aspects:

1. **Entropy source**

   What source of randomness is being transformed?

   > `puid-js` allows easy specification of the function used for source randomness

2. **ID characters**

   What characters are used in the ID?

  > `puid-js` provides 19 pre-defined character sets, as well as allows custom characters, including Unicode

3. **ID randomness**

   What is the resulting “randomness” of the IDs?

   > `puid-js` allows an intuitive, explicit specification of ID randomness

### <a name="Usage"></a>Usage

Creating a random ID generator using `puid-js` is as simple as:

```js
const { puid } = require('puid-js')

const { generator: randId } = puid()
randId()
// => 'fxgA7EO_YklcUnrPenF284'
```

Convenience: one-off generate

```js
import { generate, Chars } from 'puid-js' // or: const { generate, Chars } = require('puid-js')

const id = generate() // defaults (128 bits, Safe64, secure entropy)
const token = generate({ bits: 256, chars: Chars.HexUpper })

// generate() throws on invalid config — use try/catch if you pass dynamic input
try {
  generate({ total: 1000 })
} catch (err) {
  console.error('Invalid config:', err.message)
}
```

Stable deep import:

```js
import generate from 'puid-js/generate'
```

**Entropy Source**

`puid-js` uses `crypto.randomBytes` as the default entropy source. Options can be used to configure a specific entropy source:

- `entropyBytes`: any function of the form `(n: number): Uint8Array`, such as `crypto.randomBytes`
- `entropyValues`: any function of the form `(buf: Uint8Array): void`, such as `crypto.getRandomValues`

These options make it easy to use `puid-js` in either a `nodejs` or web environment. It also allows for using any suitable third-party entropy source. The project includes an experimental PRNG random bytes generator, `prngBytes`, and the test code uses the `entropyBytes` option for deterministic testing.

```js
const { puid } = require('puid-js')

const { generator: randId } = puid({ entropyValues: crypto.getRandomValues })
randId()
// => 'j9XyiUzld40fOxSrC7L5sy'
```

**ID Characters**

By default, `puid-js` uses the [RFC 4648](https://tools.ietf.org/html/rfc4648#section-5) file system & URL safe characters. The `chars` option can be used to specify any of 19 [pre-defined character sets](#Chars) or custom characters, including Unicode:

```js
const { Chars, puid } = require('puid-js')

const { generator: hexId } = puid({ chars: Chars.Hex })
hexId()
// => '017391a839910b76295e9bf01f89b8e8'

const { generator: dingoskyId } = puid({ chars: 'dingosky' })
dingoskyId()
// => 'ksyssdddgogoigydiskyndkysddddioggooyogdykdy'

const { generator: unicodeId } = puid({ chars: 'dîñgø$kyDÎÑGØßK¥' })
unicodeId()
// => 'Î¥ñdy¥d¥ÎØ¥KkDyîdkø¥kØ¥dø$KßØgøÑ'
```

**ID Randomness**

Generated IDs have 128-bit entropy by default. `puid-js` provides a simple, intuitive way to specify ID randomness by declaring a `total` number of possible IDs with a specified `risk` of a repeat in that many IDs:

To generate up to _10 million_ random IDs with _1 in a trillion_ chance of repeat:

```js
const { Chars, puid } = require('puid-js')

const { generator: safe32Id } = puid({ total: 10e6, risk: 1e15, chars: Chars.Safe32 })
safe32Id()
// => 'fqGpPbhh3Hn49FMq4g8r'
```

The `bits` option can be used to directly specify an amount of ID randomness:

```js
const { Chars, puid } = require('puid-js')

const { generator: token } = puid({ bits: 256, chars: Chars.HexUpper })
token()
// => 'A9FFAD1F0BC314D34678B0F4D1592665D87B01311C8D37DE61FFF8A6C25F885D'
```

[TOC](#TOC)

### <a name="Installation"></a>Installation

#### Yarn

```bash
yarn add puid-js
```

Requires Node.js >= 18.

#### NPM

```bash
npm install puid-js
```

### Browser (ESM)

Note: Many bundlers honor the "browser" export condition. Importing `puid-js` in a browser build will resolve to the web entry automatically. You can also import explicitly from `puid-js/web`.

```html
<script type="module">
  import { puid, generate, Chars } from 'puid-js/web'
  // Web-friendly import: defaults to Web Crypto when available and avoids bundling Node crypto
  const { generator: id } = puid({ chars: Chars.Safe32 })
  console.log(id())
  // Or one-off
  console.log(generate({ chars: Chars.Safe32 }))
</script>
```

### <a name="API"></a>API

`puid-js` exports:

- `puid(config?) => { generator, error }` — higher-order function (HOF) to create generators
- `generate(config?) => string` — convenience wrapper returning a single ID (throws on invalid config)

The `puid` HOF takes an optional `PuidConfig` object for configuration and returns an object of the form `{ generator: () => string, error: Error }` that either passes back the `puid` generating function or an `Error` indicating a problem with the specified configuration.

#### PuidConfig

The optional `PuidConfig` object has the following fields:

- `total`: Total number of potential (i.e. expected) IDs
- `risk`: Risk of repeat in `total` IDs
- `bits`: ID entropy bits
- `chars`: ID characters
- `entropyBytes`: Function of the form `(n: number) => Uint8Array` for source entropy
- `entropyValues`: Function of the form `(buf: Uint8Array) => void` for source entropy

##### Notes

- All config fields are optional
- `total/risk` must be set together
- `total/risk` and `bits` cannot both be set
- `chars` must be valid (see `Chars.validChars` function)
- `entropyBytes` is the form of the function `crypto.randomBytes`
- `entropyValues` is the form of the function `crypto.getRandomValues`
- Only one of `entropyBytes` or `entropyValues` can be set

##### Defaults

- `bits`: 128
- `chars`: `Chars.Safe64`
- `entropyBytes`: `crypto.randomBytes`

#### `generator` API
The `puid` generator function provides:
- `decode` function that accepts a valid `puid` returns bytes
- `encode` function that accepts `bytes` and returns the `puid`
- `info` field that displays generator configuration
- `risk/1` function that approximates the `risk` of a repeat given a `total` number of IDs
- `total/1` function that approximates the `total` possible IDs for a given `risk`

- `decode`
Given a valid `puid`, returns `bytes` sufficient to generate that `puid`.
Since the actual **bits** for a `puid` may not fall on a byte boundary, the returned `bytes` value
is zero padded to the right if necessary. The call fails if the provided string arg is not a
valid puid for the generator.

Example:

```js
  const { Chars, puid } = require('puid-js')

  const { generator: alphaId } = puid({bits: 64, chars: Chars.Alpha})
  alphaId.decode('hYrenrGOImyl')
  // => Uint8Array(9) [133, 138, 222, 158, 177, 142,  34, 108, 165]
```

- `encode`
Given sufficient `bytes`, generates a `puid`.
The provided `bytes` must be sufficient to generate a `puid` for the generator.

Example:

```js
  const { Chars, puid } = require('puid-js')

  const { generator: alphaId } = puid({bits: 64, chars: Chars.Alpha})
  alphaId.encode([133, 138, 222, 158, 177, 142,  34, 108, 165])
  // => 'hYrenrGOImyl'
```

- `info`
    - `bits`: ID entropy
    - `bitsPerChar`: Entropy bits per ID character
    - `chars`: Source characters 
    - `charsName`: Name of pre-defined `Chars` or `custom`
    - `ere`: Entropy representation efficiency
    - `ete`: Entropy transform efficiency
    - `length`: ID string length

Example:

```js
  const { Chars, puid } = require('puid-js')

  const { generator: genId } = puid({ total: 1e5, risk: 1e14, chars: Chars.Base32 })
  genId()
  // => 'FJ57265CAUTZITHN'

  genId.info
  // =>
    {
      bits: 80,
      bitsPerChar: 5,
      chars: '234567ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      charsName: 'base32',
      ere: 0.63,
      ete: 1.0,
      length: 16
    }
```

- `risk`
For the `generator`, an approximate `risk` given a number of `total` possible IDs.
This is useful when specifying puid `bits` to inspect the `risk` for some `total`.

Example: (output is rounded). And remember, read this as '1 in `risk` chance of repeat'
```js
  const { Chars, puid } = require('puid-js')
  const { generator: genId } = puid({ bits: 96, chars: Chars.Safe32 })

  genId.risk(1e6)
  // => 2535303735760194600
  genId.risk(1e9)
  // => 2535301202992
  genId.risk(1e12)
  // => 2535301
```

- `total`
For the `generator`, an approximate number of `total` possible IDs for a given `risk`
This is useful when specifying puid `bits` to inspect the possible `total` given some `risk`.

Example: (output is rounded).
```js
  const { Chars, puid } = require('puid-js')
  const { generator: genId } = puid({ bits: 96, chars: Chars.Safe32 })

  genId.total(1e9)
  // => 50351774552
  genId.total(1e12)
  // => 1592262910
  genId.total(1e15)
  // => 50351775
```



### <a name="Chars"></a>Chars

There are 19 pre-defined character sets:

| Name | Count | ERE | ETE | Characters |
|------|--------|-----|-----|------------|
| Alpha | 52 | 5.7 | 0.84 | ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz |
| AlphaLower | 26 | 4.7 | 0.81 | abcdefghijklmnopqrstuvwxyz |
| AlphaUpper | 26 | 4.7 | 0.81 | ABCDEFGHIJKLMNOPQRSTUVWXYZ |
| AlphaNum | 62 | 5.95 | 0.97 | ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 |
| AlphaNumLower | 36 | 5.17 | 0.65 | abcdefghijklmnopqrstuvwxyz0123456789 |
| AlphaNumUpper | 36 | 5.17 | 0.65 | ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 |
| Base16 | 16 | 4.0 | 1.0 | 0123456789ABCDEF |
| Base32 | 32 | 5.0 | 1.0 | ABCDEFGHIJKLMNOPQRSTUVWXYZ234567 |
| Base32Hex | 32 | 5.0 | 1.0 | 0123456789abcdefghijklmnopqrstuv |
| Base32HexUpper | 32 | 5.0 | 1.0 | 0123456789ABCDEFGHIJKLMNOPQRSTUV |
| Base36 | 36 | 5.17 | 0.65 | 0123456789abcdefghijklmnopqrstuvwxyz |
| Base36Upper | 36 | 5.17 | 0.65 | 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ |
| Base45 | 45 | 5.49 | 0.78 | 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%\*+-./: |
| Base58 | 58 | 5.86 | 0.91 | 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz |
| Base62 | 62 | 5.95 | 0.97 | ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 |
| Base85 | 85 | 6.41 | 0.77 | !"#$%&'()\*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ\[\\]^\_\`abcdefghijklmnopqrstu |
| Bech32 | 32 | 5.0 | 1.0 | 023456789acdefghjklmnpqrstuvwxyz |
| Boolean | 2 | 1.0 | 1.0 | TF |
| Crockford32 | 32 | 5.0 | 1.0 | 0123456789ABCDEFGHJKMNPQRSTVWXYZ |
| Decimal | 10 | 3.32 | 0.62 | 0123456789 |
| Dna | 4 | 2.0 | 1.0 | ACGT |
| Geohash | 32 | 5.0 | 1.0 | 0123456789bcdefghjkmnpqrstuvwxyz |
| Hex | 16 | 4.0 | 1.0 | 0123456789abcdef |
| HexUpper | 16 | 4.0 | 1.0 | 0123456789ABCDEF |
| SafeAscii | 90 | 6.49 | 0.8 | !#$%&()\*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ\[\]^\_abcdefghijklmnopqrstuvwxyz{\|}~ |
| Safe32 | 32 | 5.0 | 1.0 | 2346789bdfghjmnpqrtBDFGHJLMNPQRT |
| Safe64 | 64 | 6.0 | 1.0 | ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-\_ |
| Symbol | 28 | 4.81 | 0.89 | !#$%&()\*+,-./:;<=>?@\[\]^\_{\|}~ |
| UrlSafe | 66 | 6.04 | 0.63 | ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.\_~ |
| WordSafe32 | 32 | 5.0 | 1.0 | 23456789CFGHJMPQRVWXcfghjmpqrvwx |
| ZBase32 | 32 | 5.0 | 1.0 | ybndrfg8ejkmcpqxot1uwisza345h769 |

Note: The [Metrics](#metrics) section explains ERE and ETE.

##### Description of non-obvious character sets

| Name              | Description                                                |
| :---------------- | :--------------------------------------------------------- |
| Base16            | https://datatracker.ietf.org/doc/html/rfc4648#section-8    |
| Base32            | https://datatracker.ietf.org/doc/html/rfc4648#section-6    |
| Base32Hex         | Lowercase of Base32HexUpper                             |
| Base32HexUpper    | https://datatracker.ietf.org/doc/html/rfc4648#section-7    |
| Base36            | Used by many URL shorteners                                |
| Base58            | Bitcoin base58 alphabet (excludes 0, O, I, l)              |
| Base85            | Used in Adobe PostScript and PDF                           |
| Bech32            | Bitcoin SegWit address encoding                            |
| Dna               | DNA nucleotide bases (Adenine, Cytosine, Guanine, Thymine) |
| Ascii85           | Same as SafeAscii                                        |
| Ascii90           | Same as Base85                                            |
| Crockford32       | https://www.crockford.com/base32.html                      |
| Geohash           | Used for encoding geographic coordinates                   |
| SafeAscii         | Printable ascii that does not require escape in String     |
| Safe32            | Alpha and numbers picked to reduce chance of English words |
| Safe64            | https://datatracker.ietf.org/doc/html/rfc4648#section-5    | 
| UrlSafe           | https://datatracker.ietf.org/doc/html/rfc3986#section-2.3  |
| WordSafe32        | Alpha and numbers picked to reduce chance of English words |
| ZBase32           | Zooko's Base32                                             |

#### Custom

Any `String` of up to 256 unique characters can be used for **`puid`** generation, with custom characters optimized in the same manner as the pre-defined character sets. The characters must be unique. This isn't strictly a technical requirement, **PUID** could handle duplicate characters, but the resulting randomness of the IDs is maximal when the characters are unique, so **PUID** enforces that restriction.

### Metrics

#### Entropy Representation Efficiency

Entropy Representation Efficiency (ERE) is a measure of how efficient a string ID represents the entropy of the ID itself. When referring to the entropy of an ID, we mean the Shannon Entropy of the character sequence, and that is maximal when all the permissible characters are equally likely to occur. In most random ID generators, this is the case, and the ERE is solely dependent on the count of characters in the charset, where each character represents **log2(count)** of entropy (a computer specific calc of general Shannon entropy). For example, for a hex charset there are **16** hex characters, so each character "carries" **log2(16) = 4** bits of entropy in the string ID. We say the bits per character is **4** and a random ID of **12** hex characters has **48** bits of entropy.

ERE is measured as a ratio of the bits of entropy for the ID divided by the number of bits require to represent the string (**8** bits per ID character). If each character is equally probably (the most common case), ERE is **(bits-per-char * id_len) / (8 bits * id_len)**, which simplifies to **bits-per-character/8**. The BPC displayed in the Puid Characters table is equivalent to the ERE for that charset.

There is, however, a particular random ID exception where each character is _**not**_ equally probable, namely, the often used v4 format of UUIDs. In that format, there are hyphens that carry no entropy (entropy is uncertainty, and there is _**no uncertainly**_ as to where those hyphens will be), one hex digit that is actually constrained to 1 of only 4 hex values and another that is fixed. This formatting results in a ID of 36 characters with a total entropy of 122 bits. The ERE of a v4 UUID is, therefore, **122 / (8 * 36) = 0.4236**.

#### Entropy Transform Efficiency

Entropy Transform Efficiency (ETE) is a measure of how efficiently source entropy is transformed into random ID entropy. For charsets with a character count that is a power of 2, all of the source entropy bits can be utilized during random ID generation. Each generated ID character requires exactly **log2(count)** bits, so the incoming source entropy can easily be carved into appropriate indices for character selection. Since ETE represents the ratio of output entropy bits to input entropy source, when all of the bits are utilized ETE is **1.0**.

Even for charsets with power of 2 character count, ETE is only the theoretical maximum of **1.0** _**if**_ the input entropy source is used as described above. Unfortunately, that is not the case with many random ID generation schemes. Some schemes use the entire output of a call to source entropy to create a single index used to select a character. Such schemes have very poor ETE.

For charsets with a character count that is not a power of 2, some bits will inevitably be discarded since the smallest number of bits required to select a character, **ceil(log2(count))**, will potentially result in an index beyond the character count. A first-cut, naïve approach to this reality is to simply throw away all the bits when the index is too large.

However, a more sophisticated scheme of bit slicing can actually improve on the naïve approach. Puid extends the bit slicing scheme by adding a bit shifting scheme to the algorithm, wherein a _**minimum**_ number of bits in the "over the limit" bits are discarded by observing that some bit patterns of length less than **ceil(log2(count))** already guarantee the bits will be over the limit, and _**only**_ those bits need be discarded. 

As example, using the **AlphaNumLower** charset, which has 36 characters, **ceil(log2(36)) = 6** bits are required to create a suitable index. However, if those bits start with the bit pattern **11xxxx**, the index would be out of bounds regardless of the **xxxx** bits, so Puid only tosses the first two bits and keeps the trailing four bits for use in the next index. (It is beyond scope to discuss here, but analysis shows this bit shifting scheme does not alter the random characteristics of generated IDs). So whereas the naïve approach would have an ETE of **0.485**, Puid achieves an ETE of **0.646**, a **33%** improvement. The `bench/alphanum_lower_ete.exs` script has detailed analysis.

[TOC](#TOC)

## <a name="Motivation"></a>Motivation

Developers frequently need random strings in applications ranging from long-term (e.g., data store keys) to short-term (e.g. DOM IDs on a web page). These IDs are, of course, of secondary concern. No one wants to think about them much, they just want to be easy to generate.

But developers _should_ think about the random strings they use. The generation of random IDs is a design choice, and just like any other design choice, that choice should be explicit in nature and based on a familiar with why such choices are made. Yet a cursory review of random string libraries, as well as random string usage in many applications, yields a lack of clarity that belies careful consideration.

[TOC](#TOC)

### <a name="WhatIsARandomString"></a>What is a random string?

Although this may seem to have an obvious answer, there is actually a key, often overlooked subtlety: a random string _is not random_ in and of itself. To understand this, we need to understand [_entropy_](<https://en.wikipedia.org/wiki/Entropy_(information_theory)>) as it relates to computers.

A somewhat simplistic statement for entropy from information theory is: _entropy is a measure of uncertainty in the possible outcomes of an event_. Given the base 2 system inherent in computers, this uncertainty naturally maps to a unit of bits (known as Shannon entropy). So we see statements like "_this random string has 128 bits of entropy_". But here is the subtlety:

> _**A random string does not have entropy**_

Rather, a random string represents _captured_ entropy, entropy that was produced by _some other_ process. For example, you cannot look at the hex string **`'18f6303a'`** and definitively say it has 32 bits of entropy. To see why, suppose you run the following code snippet and get **`'18f6303a'`**:

```js
const randId = () => {
  if (Math.random() < 0.5) return '18f6303a'
  return '1'
}
randId()
// => '18f6303a'
```

In this case, the entropy of the string **`'18f6303a'`** is 1 bit. That's it; 1 bit. The same entropy as when the outcome **`'1'`** is observed. In either case, there are only two equally possible outcomes and the resulting entropy is therefore 1 bit. It's important to have this clear understanding:

> _**Entropy is a measure in the uncertainty of an event, independent of the representation of that uncertainty**_

In information theory you would state the above process has two symbols, **`18f6303a`** and **`1`**, and the outcome is equally likely to be either symbol. Hence there is 1 bit of entropy in the process. The symbols don't really matter. It would be much more likely to see the symbols **`T`** and **`F`**, or **`0`** and **`1`**, or even **`ON`** and **`OFF`**, but regardless, the process _produces_ 1 bit of entropy and symbols used to _represent_ that entropy do not effect the entropy itself.

#### Entropy source

Random string generators need an external source of entropy and typically use a system resource for that entropy. In JavaScript, this could be either `crypto.randomBytes` or `crypto.getRandomValues`, or even `Math.random`. Nonetheless, it is important to appreciate that the properties of the generated random strings depend on the characteristics of the entropy source. For example, whether a random string is suitable for use as a secure token depends on the security characteristics of the entropy source, not on the string representation of the token.

#### ID characters

As noted, the characters (symbols) used for a random string do not determine the entropy. However, the number of unique characters does. Under the assumption that each character is equally probable (which maximizes entropy) it is easy to show the entropy per character is a constant log<sub>2</sub>(N), where `N` is of the number of characters available.

#### ID randomness

String randomness is determined by the entropy per character times the number of characters in the string. The _quality_ of that randomness is directly tied to the quality of the entropy source. The _randomness_ depends on the number of available characters and the length of the string.

And finally we can state: a random string is a character representation of captured system entropy.

[TOC](#TOC)

### <a name="Uniqueness"></a>Uniqueness

The goal of `puid-js` is to provide simple, intuitive random ID generation using random strings. As noted above, we can consider random string generation as the _transformation_ of system entropy into a character _representation_, and random IDs as being the use of such random strings to represent unique IDs. There is a catch though; a big catch:

> _**Random strings do not produce unique IDs**_

Recall that entropy is the measure of uncertainty in the possible outcomes of an event. It is critical that the uncertainty of each event is _independent_ of all prior events. This means two separate events _can_ produce the same result (i.e., the same ID); otherwise the process isn't random. You could, of course, compare each generated random string to all prior IDs and thereby achieve uniqueness. But some such post-processing must occur to ensure random IDs are truly unique.

Deterministic uniqueness checks, however, incur significant processing overhead and are rarely used. Instead, developers (knowingly?) relax the requirement that random IDs are truly, deterministically unique for a much lesser standard, one of probabilistic uniqueness. We "trust" that randomly generated IDs are unique by virtue of the chance of a repeated ID being very low.

And once again, we reach a point of subtlety. (And we thought random strings were easy!) The "trust" that randomly generated IDs are unique actually turns entropy as it's been discussed thus far on it's head. Instead of viewing entropy as a measure of uncertainty in the _generation_ of IDs, we consider entropy as a measure of the probability that no two IDs will be the same. To be sure, we want this probability to be very low, but for random strings it _cannot_ be zero. And to be clear, _entropy is not such a measure_. Not directly anyway. Yes, the higher the entropy, the lower the probability, but it takes a bit of math to correlate the two in a proper manner. (Don't worry, `puid-js` takes care of this math for you).

Furthermore, the probable uniqueness of ID generation is always in some limited context. Consider IDs for a data store. You don't care if a generated ID is the same as an ID used in another data store in another application in another company in a galaxy far, far away. You care that the ID is (probably) unique within the context of your application.

To recap, random string generation does not produce unique IDs, but rather, IDs that are probably unique (within some context). That subtlety is important enough it's baked into the name of `puid-js` (and fully at odds with term `UUID`).

[TOC](#TOC)

### <a name="IDRandomness"></a>ID randomness

So what does the statement "_these IDs have 122 bits of entropy_" actually mean? Entropy is a measure of uncertainty after all, and we're concerned that our IDs be unique, probably unique anyway. So what does "122 bits of entropy" mean for the probable uniqueness of IDs?

First, let's be clear what it _doesn't_ mean. We're concerned with uniqueness of a bunch of IDs in a certain context. The randomness of _any one_ of those ID isn't the real concern. Yes, we can say "_given 122 bits of entropy_" each ID has a probability of 2<sup>-122</sup> of occurring. And yes, that certainly makes the occurrence of any particular ID rare. But with respect to the uniqueness of IDs, it isn't "enough" to tell the whole story.

And here again we hit another subtlety. It turns out the question, as posed, is under-specified, i.e. it is not specific enough to be answered. To properly determine how entropy relates to the probable uniqueness of IDs, we need to specify _how many_ IDs are to be generated in a certain context. Only then can we determine the probability of generating unique IDs. So our question really needs to be: given **N** bits of entropy, what is the probability of uniqueness in **T** random IDs?

Fortunately, there is a mathematical correlation between entropy and the probability of uniqueness. This correlation is often explored via the [Birthday Paradox](https://en.wikipedia.org/wiki/Birthday_problem#Cast_as_a_collision_problem). Why paradox? Because the relationship, when cast as a problem of unique birthdays in some number of people, is initially quite surprising. But nonetheless, the relationship exists, it is well-known, and `puid-js` will take care of the math for us.

At this point we can now note that rather than say "_these IDs have **N** bits of entropy_", we actually want to say "_generating **T** of these IDs has a risk **R** of a repeat_". And fortunately, `puid-js` allows straightforward specification of that very statement for random ID generation. Using `puid-js`, you can easily specify "_I want **T** random IDs with a risk **R** of repeat_". `puid-js` will take care of using the correct entropy in efficiently generating the IDs.

[TOC](#TOC)

### <a name="Efficiency"></a>Efficiency

The efficiency of generating random IDs has no bearing on the statistical characteristics of the IDs themselves. But who doesn't care about efficiency? Unfortunately, most random string generation, it seems.

#### Entropy source

As previously stated, random ID generation is basically a _transformation_ of an entropy source into a character _representation_ of captured entropy. But the entropy of the source and the entropy of the captured ID _is not the same thing_.

To understand the difference, we'll investigate an example that is, surprisingly, quite common. Consider the following strategy for generating random strings: using a fixed list of **k** characters, use a random uniform integer **i**, `0 <= i < k`, as an index into the list to select a character. Repeat this **n** times, where **n** is the length of the desired string. In JavaScript this might look like:

```js
const commonId = (n) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < n; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}

commonId(8)
// => 's5hExiXb'
```

First, consider the amount of source entropy used in the code above. The JavaScript spec doesn't declare the amount of entropy generated by `Math.random`, but let's give it the upper bound of 52 bits (since that's the number of bits in the fraction of a JavaScript double-precision float). So generating an 8 character ID above consumes 8 \* 52 = 416 bits of source entropy.

Second, consider how much entropy was captured by the ID. Given there are 26 characters, each character represents log<sub>2</sub>(26) = 4.7 bits of entropy. So each generated ID represents 8 \* 4.7 = 37.6 bits of entropy.

Hmmm. That means the ratio of ID entropy to source entropy is 37.6 / 424 = 0.09, or a whopping **9%**. That's not an efficiency most developers would be comfortable with. Granted, this is a particularly egregious example, but most random ID generation suffers such inefficient use of source entropy.

Without delving into the specifics (see the code?), `puid-js` employs various means to maximize the use of source entropy. As comparison, `puid-js` uses **87.5%** of source entropy in generating random IDs using lower case alpha characters. For character sets with counts equal a power of 2, `puid-js` uses 100% of source entropy.

#### Characters

As previous noted, the entropy of a random string is equal to the entropy per character times the length of the string. Using this value leads to an easy calculation of **entropy representation efficiency** (`ere`). We can define `ere` as the ratio of random string entropy to the number of bits required to represent the string. For example, the lower case alphabet has an entropy per character of 4.7, so an ID of length 8 using those characters has 37.6 bits of entropy. Since each lower case character requires 1 byte, this leads to an `ere` of 37.6 / 64 = 0.59, or 59%. Non-ascii characters, of course, occupy more than 1 byte. `puid-js` uses the `Buffer.byteLength` function to compute `ere`.

<a name="UUIDCharacters"></a>

The total entropy of a string is the product of the entropy per character times the string length _only_ if each character in the final string is equally probable. This is always the case for `puid-js`, and is usually the case for other random string generators. There is, however, a notable exception: the version 4 string representation of a `uuid`. As defined in [RFC 4122, Section 4.4](https://tools.ietf.org/html/rfc4122#section-4.4), a v4 `uuid` uses a total of 32 hex and 4 hyphen characters. Although the hex characters can represent 4 bits of entropy each, 6 bits of the hex representation in a `uuid` are actually fixed, so there is only `32*4 - 6 = 122`-bits of entropy (not 128). The 4 fixed-position hyphen characters contribute zero entropy. So a 36 character `uuid` has an `ere` of `122 / (36*8) = 0.40`, or **40%**. Compare that to, say, the default `puid-js` generator, which has slightly higher entropy (132 bits) and yet yields an `ere` of 0.75, or **75%**. Who doesn't love efficiency?

[TOC](#TOC)

### <a name="Overkill"></a>Overkill and Under Specify

#### Overkill

Random string generation is plagued by overkill and under specified usage. Consider the all too frequent use of `uuid`s as random strings. The rational is seemingly that the probability of a repeated `uuid` is low. Yes, it is admittedly low, but is that sufficient reason to use a `uuid` without further thought? For example, suppose a `uuid` is used as a key in a data store that will have at most a thousand items. What is the probability of a repeated `uuid` in this case? It's 1 in a nonillion. That's 10^30, or 1 followed by 30 zeros, or million times the estimated number of stars in the universe. Really? Doesn't that seem a bit overkill? Do really you need that level of assurance? And if so, why stop there? Why not concatenate two `uuid`s and get an even more ridiculous level of "assurance".

Or why not be a bit more reasonable and think about the problem for a moment. Suppose you accept a 1 in 10^15 risk of repeat. That's still a _really_ low risk. Ah, but wait, to do that you can't use a `uuid`, because `uuid` generation isn't flexible. The characters are fixed, the representation is fixed, and the bits of entropy are fixed. But you could very easily use `puid-js` to generate such IDs:

```js
const { puid } = require('puid-js')

const { generator: dbId } = puid({ total: 1000, risk: 1e15 })
dbId()
// => 'c1DVnnbI3RTr'
```

The resulting ID have 72 bits of entropy. But guess what? You don't care. What you care is having explicitly stated you expect to have 1000 IDs and your level of repeat risk is 1 in a quadrillion. It's right there in the code. And as added bonus, the IDs are only 12 characters long, not 36. Who doesn't like ease, control and efficiency?

#### Under specify

Another head-scratcher in schemes that generate random strings is using an API that explicitly declares string length. Why is this troubling? Because that declaration doesn't specify the actual amount of desired randomness, either needed or achieved. Suppose you are tasked with maintaining code that is using random IDs of 15 characters composed of digits and lower alpha characters. Why are the IDs 15 characters long? Unless there are code comments, you have no idea. And without knowing how many IDs are expected, you can't determine the risk of a repeat, i.e., you can't even make a statement about how random the random IDs actually are! Was 15 chosen for a reason, or just because it made the IDs look good?

Now, suppose you are tasked to maintain this code:

```js
const { puid } = require('puid-js')

const { generator: randId } = puid({ total: 500000, risk: 1e12, chars: Chars.AlphaNumLower })
randId()
// => 'u4a4fbhhwlsikct'
```

Hmmm. Looks like there are 500,000 IDs expected and the repeat risk is 1 in a trillion. No guessing. The code is explicit. Oh, and by the way, the IDs are 15 characters long. But who cares? It's the ID randomness that matters, not the length.

[TOC](#TOC)

### <a name="Efficiencies"></a>Efficiencies

`Puid` employs a number of efficiencies for random ID generation:

- Only the number of bytes necessary to generate the next `puid` are fetched from the entropy source
- Each `puid` character is generated by slicing the minimum number of entropy bits possible
- Any left-over bits are carried forward and used in generating the next `puid`
- All characters are equally probable to maximize captured entropy
- Only characters that represent entropy are present in the final ID
- Easily specified `total/risk` ensures ID are only as long as actually necessary

[TOC](#TOC)

### <a name="tl;dr"></a>tl;dr

`Puid` is a simple, flexible and efficient random ID generator:

- **Ease**

  Random ID generator specified in one line of code

- **Flexible**

  Full control over entropy source, ID characters and amount of ID randomness

- **Explicit**

  Clear specification of chosen level of randomness

- **Efficient**

  Maximum use of system entropy

- **Compact**

  ID strings represent maximum entropy for characters used

- **Secure**

  Defaults to a secure source of entropy and at least 128 bits of ID entropy

```js
  const { Chars, puid } = require('puid-js')

  const { generator: randId } = puid({ chars: Chars.Safe32, total: 10e6, risk: 1e15 })
  randId()
  // => 'tp9TJPNM2rmMLN22prFf'
```

[TOC](#TOC)

### <a name="UUIDv4Migration"></a>Migrating from UUID v4

- UUID v4 has 122 bits of entropy (36 chars with hyphens; 32 hex chars without). Default `puid-js` IDs are ~132 bits in 22 URL/file-safe chars.

Replace uuidv4() one-off

```js
// before
import { v4 as uuidv4 } from 'uuid'
const id = uuidv4()

// after
import { generate, Chars } from 'puid-js'
// ≈132 bits, 22 chars, URL/file-safe
const id = generate({ chars: Chars.Safe64 })

// hex-like (32 chars, 128 bits)
const hexId = generate({ bits: 128, chars: Chars.HexUpper })
```

Use a generator in hot paths

```js
import { puid, Chars } from 'puid-js'

// explicit bits (≈ UUID v4 or better)
const { generator: id128 } = puid({ bits: 128, chars: Chars.Safe64 })

// or size by total/risk (10M IDs, 1e-12 repeat risk)
const { generator: sized } = puid({ total: 1e7, risk: 1e12, chars: Chars.Safe64 })

const id = id128()
```

Browser

```js
import { generate, Chars } from 'puid-js/web'
const id = generate({ chars: Chars.Safe64 })
```

Error handling for generate()

```js
try {
  generate({ total: 1000 }) // invalid: missing risk
} catch (err) {
  // handle invalid config
}
```

Notes
- If your DB/validators assume UUID format/length, update to accept generic ID strings. Default Safe64 is 22 chars; HexUpper at 128 bits is 32 chars.
- Charset guidance: Safe64 (shortest URL/file-safe), Hex/HexUpper (compat), Safe32/WordSafe32 (human-friendlier).

And remember, you rarely need the 122-bytes of entropy provided by UUID, and you certainly never need the inefficiency of the string representation!
