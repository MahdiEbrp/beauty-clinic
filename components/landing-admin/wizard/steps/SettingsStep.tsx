"use client";

import { OrderActivePanel } from "../../forms/fields";

export default function SettingsStep({
  displayOrder,
  onDisplayOrderChange,
  isActive,
  onToggleActive,
}: {
  displayOrder: string;
  onDisplayOrderChange: (value: string) => void;
  isActive: boolean;
  onToggleActive: () => void;
}) {
  return (
    <OrderActivePanel
      displayOrder={displayOrder}
      onDisplayOrderChange={onDisplayOrderChange}
      isActive={isActive}
      onToggleActive={onToggleActive}
    />
  );
}