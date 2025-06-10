import React from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { formatDate } from "@/utils/formatDate";
import { getStatusColor } from "@/utils/statusColor";

export const HistoryModal = ({ report, isOpen, onClose }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        style: {
          backdropFilter: "blur(5px)", // Adds the blur effect
          minWidth: "30rem",
        },
      }}
    >
      <DialogTitle className="text-darkprim text-center">
        Report details
        {report?.status && (
          <span
            className={`absolute text-sm top-2 right-4 ${getStatusColor(
              report?.status
            )}`}
          >
            {report.status}
          </span>
        )}
      </DialogTitle>
      <DialogContent>
        <div className="report-detail">
          <p>
            <strong>ID:</strong> {report?._id}
          </p>
          <p>
            <strong>Report type:</strong> {report?.type}
          </p>
          <p>
            <strong>Tags:</strong> {report?.tags?.join(", ")}
          </p>
          <p>
            <strong>Content:</strong> {report?.content}
          </p>
          <p>
            <strong>User:</strong> {report?.user?.username}
          </p>
          <p>
            <strong>Reviewed by:</strong> {report?.reviewer?.username}
          </p>
          <p>
            <strong>Reviewed At:</strong> {formatDate(report?.updatedAt)}
          </p>
          <p>
            <strong>Created At:</strong> {formatDate(report?.createdAt)}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
