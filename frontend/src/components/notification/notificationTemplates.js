const EmailSentSuccess = (t) => ({
  id: Date.now(),
  message: t,
  type: "success",
})

const EmailSentFailure = (t, error) => ({
  id: Date.now(),
  message: `${t}: ${error.message}`,
  type: "error",
})

const EmailSendWait = (t) => ({
  id: Date.now(),
  message: t,
  type: "warning",
  duration: 7000, // Kesto 7 sekuntia
})

const OtpRobotCheck = (t) => ({
  id: Date.now(),
  message: t,
  type: "error",
})

const OtpVerified = (t) => ({
  id: Date.now(),
  message: t,
  type: "success",
})

const OtpNotVerified = (t) => ({
  id: Date.now(),
  message: t,
  type: "error",
})

const UserFailure = (t) => ({
  id: Date.now(),
  message: t,
  type: "error",
})

const EventNotFound = (t) => ({
  id: Date.now(),
  message: t,
  type: "error",
})

const EventJoinSuccess = (t) => ({
  id: Date.now(),
  message: t,
  type: "success",
})

const EventJoinFailure = (t) => ({
  id: Date.now(),
  message: t,
  type: "error",
})

const EventCreated = (t) => ({
  id: Date.now(),
  message: t,
  type: "success",
})

const EventDeletionWarning = (t) => ({
  id: Date.now(),
  message: t,
  type: "warning",
})

const EventDeletionFailure = (t) => ({
  id: Date.now(),
  message: t,
  type: "error",
})

const EventDeletion = (t) => ({
  id: Date.now(),
  message: t,
  type: "success",
})

const EventLeaveSuccess = (t) => ({
  id: Date.now(),
  message: t,
  type: "success",
})

const EventLeaveFailure = (t) => ({
  id: Date.now(),
  message: t,
  type: "error",
})

const EventCreationFailure = (t) => ({
  id: Date.now(),
  message: t,
  type: "error"
})

const DetailUpdated = (t) => ({
  id: Date.now(),
  message: t,
  type: "success",
})

const EmailUpdateFailure = (t) => ({
  id: Date.now(),
  message: t,
  type: "error",
})

const TokenNotFound = (t) => ({
  id: Date.now(),
  message: t,
  type: "error",
})

const LanguageUpdateFailure = (t) => ({
  id: Date.now(),
  message: t,
  type: "error",
})

const MapUpdateError = (t) => ({
  id: Date.now(),
  message: t,
  type: "error",
})

const EmailAlreadyRegistered = (t) => ({
  id: Date.now(),
  message: t,
  type: "error",
})


export {
  EmailSentSuccess,
  EmailSentFailure,
  EmailSendWait,
  OtpRobotCheck,
  OtpVerified,
  OtpNotVerified,
  UserFailure,
  EventNotFound,
  EventCreated,
  EventJoinSuccess,
  EventJoinFailure,
  EventDeletionWarning,
  EventDeletionFailure,
  EventLeaveSuccess,
  EventDeletion,
  EventLeaveFailure,
  EventCreationFailure,
  DetailUpdated,
  EmailUpdateFailure,
  TokenNotFound,
  LanguageUpdateFailure,
  MapUpdateError,
  EmailAlreadyRegistered
}
