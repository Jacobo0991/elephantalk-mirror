import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { formatDate } from "@/utils/formatDate";
import { ChangeStatus } from "@/services/api";
import { useSession } from "next-auth/react";

export const MonitorModal = ({ report, isOpen, onClose, refresh }) => {
  const session = useSession();

  const handleApprove = (rep) => {
    const repstatus = async () => {
      try {
        const result = await ChangeStatus({
          token: session?.data?.accessToken,
          id: rep,
          status: "accepted",
        });

        onClose();
        refresh(true);
      } catch (error) {}
    };

    repstatus();
  };

  const handleReject = (rep) => {
    const repstatus = async () => {
      try {
        const result = await ChangeStatus({
          token: session?.data?.accessToken,
          id: rep,
          status: "rejected",
        });

        onClose();
        refresh(true);
      } catch (error) {}
    };

    repstatus();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        style: {
          backdropFilter: "blur(5px)", // Adds the blur effect\
          minWidth: "30rem",
        },
      }}
    >
      <DialogTitle className="text-darkprim text-center">
        Report details
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
            <strong>Created At:</strong> {formatDate(report?.createdAt)}
          </p>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleReject(report?._id)} color="primary">
          Keep
        </Button>
        <Button onClick={() => handleApprove(report?._id)} color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
