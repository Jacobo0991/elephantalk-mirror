export enum ReportStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum ReportDecideAction {
  ACCEPTED = ReportStatus.ACCEPTED,
  REJECTED = ReportStatus.REJECTED,
}
