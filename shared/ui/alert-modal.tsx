"use client";

type AlertModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

export default function AlertModal({
  open,
  title,
  description,
  confirmLabel = "확인",
  onConfirm,
}: AlertModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="alert-modal-title">
      <div className="modal-card">
        <p className="section-kicker">알림</p>
        <h2 id="alert-modal-title" className="modal-title">
          {title}
        </h2>
        <p className="modal-copy">{description}</p>
        <button type="button" className="btn-primary mt-6 w-full" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
