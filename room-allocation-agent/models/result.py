from pydantic import BaseModel


class AllocationResult(BaseModel):
    """Standard return type for every tool that writes data to NestJS."""
    success: bool
    message: str = ""
    allocated_count: int = 0
    failed_count: int = 0
    failures: list[str] = []

    def summary(self) -> str:
        """Plain-English one-liner for the agent to include in its response."""
        if self.success and self.allocated_count:
            base = f"Done. {self.allocated_count} action(s) completed successfully."
        elif self.success:
            base = f"Done. {self.message}"
        else:
            base = f"Failed: {self.message}"
        if self.failures:
            base += f" Issues: {'; '.join(self.failures)}"
        return base
