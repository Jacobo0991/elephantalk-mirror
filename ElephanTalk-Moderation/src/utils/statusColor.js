export const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "text-primary";
    case "approved":
      return "text-green-600";
    case "rejected":
      return "text-red-500";
    default:
      return "text-primary";
  }
};
