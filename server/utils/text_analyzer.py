"""
Text Analysis Module
Analyzes text quality: grammar, repetition, structure (intro, body, conclusion)
"""

import re
from typing import Dict, List
import nltk
from collections import Counter

# Download required NLTK data (will be done on first run)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)


def analyze_grammar_quality(text: str) -> Dict[str, float]:
    """
    Analyze grammar quality using basic heuristics.
    
    Args:
        text: Input text
    
    Returns:
        Dictionary with grammar quality metrics
    """
    if not text or len(text.strip()) == 0:
        return {
            "score": 0.0,
            "issues": [],
            "sentence_count": 0
        }
    
    sentences = nltk.sent_tokenize(text)
    sentence_count = len(sentences)
    
    issues = []
    issue_count = 0
    
    # Check for common grammar issues
    # 1. Sentence length (too long sentences)
    for i, sentence in enumerate(sentences):
        words = sentence.split()
        if len(words) > 50:
            issues.append(f"Sentence {i+1} is too long ({len(words)} words)")
            issue_count += 1
    
    # 2. Repeated words in close proximity
    words = text.lower().split()
    for i in range(len(words) - 2):
        if words[i] == words[i+1] == words[i+2]:
            issues.append(f"Repeated word '{words[i]}' three times in a row")
            issue_count += 1
    
    # 3. Check for sentence fragments (very short sentences)
    short_sentences = [s for s in sentences if len(s.split()) < 3]
    if len(short_sentences) > sentence_count * 0.3:  # More than 30% are fragments
        issues.append("Too many sentence fragments")
        issue_count += 1
    
    # Calculate grammar score (0-100)
    # Penalize based on issue density
    if sentence_count > 0:
        issue_density = issue_count / sentence_count
        grammar_score = max(0, 100 - (issue_density * 50))
    else:
        grammar_score = 0.0
    
    return {
        "score": round(grammar_score, 2),
        "issues": issues[:5],  # Limit to 5 issues
        "sentence_count": sentence_count,
        "issue_count": issue_count
    }


def detect_repetition(text: str) -> Dict[str, any]:
    """
    Detect repetitive phrases and words.
    
    Args:
        text: Input text
    
    Returns:
        Dictionary with repetition analysis
    """
    if not text:
        return {
            "repetition_score": 100.0,
            "repeated_phrases": [],
            "repeated_words": {}
        }
    
    words = text.lower().split()
    
    # Find repeated phrases (3+ words)
    phrase_length = 3
    phrases = []
    for i in range(len(words) - phrase_length + 1):
        phrase = " ".join(words[i:i+phrase_length])
        phrases.append(phrase)
    
    phrase_counts = Counter(phrases)
    repeated_phrases = [
        {"phrase": phrase, "count": count}
        for phrase, count in phrase_counts.items()
        if count > 1
    ]
    repeated_phrases.sort(key=lambda x: x["count"], reverse=True)
    
    # Find frequently repeated words (excluding common words)
    common_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "is", "are", "was", "were"}
    word_counts = Counter(words)
    repeated_words = {
        word: count
        for word, count in word_counts.items()
        if count > 3 and word not in common_words
    }
    
    # Calculate repetition score (0-100)
    # Penalize based on repetition density
    total_words = len(words)
    if total_words > 0:
        repetition_penalty = (len(repeated_phrases) * 5 + len(repeated_words) * 2) / total_words * 100
        repetition_score = max(0, 100 - repetition_penalty)
    else:
        repetition_score = 100.0
    
    return {
        "repetition_score": round(repetition_score, 2),
        "repeated_phrases": repeated_phrases[:5],  # Top 5
        "repeated_words": dict(list(repeated_words.items())[:10])  # Top 10
    }


def analyze_structure(text: str) -> Dict[str, any]:
    """
    Analyze presentation structure (intro, body, conclusion).
    
    Args:
        text: Input text
    
    Returns:
        Dictionary with structure analysis
    """
    if not text:
        return {
            "has_intro": False,
            "has_body": False,
            "has_conclusion": False,
            "structure_score": 0.0,
            "word_count": 0
        }
    
    text_lower = text.lower()
    sentences = nltk.sent_tokenize(text)
    word_count = len(text.split())
    
    # Introduction indicators
    intro_keywords = [
        "today", "introduce", "present", "discuss", "talk about",
        "overview", "agenda", "purpose", "goal", "objective"
    ]
    has_intro = any(keyword in text_lower[:200] for keyword in intro_keywords)  # Check first 200 chars
    
    # Conclusion indicators
    conclusion_keywords = [
        "conclusion", "summary", "summarize", "conclude", "finally",
        "in summary", "to sum up", "in conclusion", "thank you", "questions"
    ]
    has_conclusion = any(keyword in text_lower[-300:] for keyword in conclusion_keywords)  # Check last 300 chars
    
    # Body: if text is substantial and has middle content
    has_body = word_count > 50 and len(sentences) > 3
    
    # Calculate structure score
    score = 0.0
    if has_intro:
        score += 30
    if has_body:
        score += 40
    if has_conclusion:
        score += 30
    
    return {
        "has_intro": has_intro,
        "has_body": has_body,
        "has_conclusion": has_conclusion,
        "structure_score": round(score, 2),
        "word_count": word_count,
        "sentence_count": len(sentences)
    }


def analyze_text_complete(text: str) -> Dict:
    """
    Complete text analysis combining all metrics.
    
    Args:
        text: Input text
    
    Returns:
        Complete text analysis dictionary
    """
    grammar = analyze_grammar_quality(text)
    repetition = detect_repetition(text)
    structure = analyze_structure(text)
    
    return {
        "grammar": grammar,
        "repetition": repetition,
        "structure": structure,
        "text_length": len(text),
        "word_count": len(text.split())
    }
