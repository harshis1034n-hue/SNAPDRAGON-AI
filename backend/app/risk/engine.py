"""
SnapSafe AI - Risk Assessment Engine
Computes granular risk scoring, composite privacy score (0-100),
and risk exposure delta between raw and redacted screen states.
"""

from typing import List, Dict, Any
from app.detection.engine import DetectedEntity


# Numerical weights for risk levels
RISK_WEIGHTS = {
    "CRITICAL": 35,
    "HIGH": 20,
    "MEDIUM": 10,
    "LOW": 5
}


class RiskEngine:
    """
    Evaluates total privacy exposure and computes composite safety scores.
    """

    @staticmethod
    def calculate_assessment(
        entities: List[DetectedEntity],
        active_masking_ids: List[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate total exposure score and counts.
        :param entities: All detected entities
        :param active_masking_ids: IDs of entities currently masked
        """
        if active_masking_ids is None:
            # By default, assume all are marked for masking
            active_masking_ids = [e.id for e in entities if e.is_masked]

        counts = {
            "CRITICAL": 0,
            "HIGH": 0,
            "MEDIUM": 0,
            "LOW": 0
        }

        raw_exposure_score = 0
        residual_exposure_score = 0

        for entity in entities:
            risk = entity.risk.upper()
            weight = RISK_WEIGHTS.get(risk, 5)
            counts[risk] = counts.get(risk, 0) + 1
            raw_exposure_score += weight

            # If not masked, residual risk remains
            if entity.id not in active_masking_ids:
                residual_exposure_score += weight

        # Normalize exposure score to 0 - 100 scale
        privacy_risk_raw = min(100, raw_exposure_score)
        privacy_risk_after = min(100, residual_exposure_score)

        # Privacy Score (inverse of risk): 100 is pristine, 0 is fully compromised
        privacy_score_raw = max(0, 100 - privacy_risk_raw)
        privacy_score_after = max(0, 100 - privacy_risk_after)

        total_detected = len(entities)
        total_masked = len(active_masking_ids)

        return {
            "totalDetected": total_detected,
            "totalMasked": total_masked,
            "counts": counts,
            "criticalCount": counts["CRITICAL"],
            "highCount": counts["HIGH"],
            "mediumCount": counts["MEDIUM"],
            "lowCount": counts["LOW"],
            "privacyRiskRaw": privacy_risk_raw,
            "privacyRiskAfter": privacy_risk_after,
            "privacyScoreRaw": privacy_score_raw,
            "privacyScoreAfter": privacy_score_after,
            "dataUploadedBytes": 0,
            "isSafeToShare": privacy_risk_after <= 15
        }
