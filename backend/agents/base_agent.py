from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime

class BaseAgent(ABC):
    def __init__(self, name: str, role: str, description: str):
        self.name = name
        self.role = role
        self.description = description
        self.execution_logs: List[Dict[str, Any]] = []

    def log(self, message: str, level: str = "INFO", data: Optional[Dict[str, Any]] = None):
        entry = {
            "timestamp": datetime.now().strftime("%H:%M:%S.%f")[:-3],
            "agent": self.name,
            "level": level,
            "message": message,
            "data": data or {}
        }
        self.execution_logs.append(entry)

    @abstractmethod
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent's core planning logic."""
        pass
