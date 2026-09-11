"""
SnapSafe AI - Entropy & Validator Utilities
Used to distinguish random cryptographic keys/tokens from natural language.
"""

import math
from typing import Dict


def calculate_shannon_entropy(text: str) -> float:
    """
    Calculate the Shannon entropy of a string.
    High entropy (> 3.2 for strings >= 16 chars) strongly indicates
    API keys, hashes, or encrypted tokens.
    """
    if not text:
        return 0.0

    frequencies: Dict[str, int] = {}
    for char in text:
        frequencies[char] = frequencies.get(char, 0) + 1

    length = len(text)
    entropy = 0.0
    for count in frequencies.values():
        p = count / length
        entropy -= p * math.log2(p)

    return entropy


def luhn_checksum_valid(number_str: str) -> bool:
    """
    Validate credit / debit card numbers using the Luhn checksum algorithm (Mod 10).
    """
    digits = [int(c) for c in number_str if c.isdigit()]
    if len(digits) < 13 or len(digits) > 19:
        return False

    checksum = 0
    reverse_digits = digits[::-1]
    for i, digit in enumerate(reverse_digits):
        if i % 2 == 1:
            doubled = digit * 2
            checksum += doubled - 9 if doubled > 9 else doubled
        else:
            checksum += digit

    return (checksum % 10) == 0
