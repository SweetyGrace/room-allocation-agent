import React from "react";

export interface iDisplayCountProps {
  userName: string;
  count: number;
}

export const DisplayCount: React.FC<iDisplayCountProps> = ({
  userName = "User",
  count,
}) => {
  return (
    <>
      <span data-testid="display-count"> Hello {userName}</span>
      <div data-testid="count">{count}</div>
    </>
  );
};
