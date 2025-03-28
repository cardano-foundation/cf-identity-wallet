import { IssueCredentialStage } from "./RequestPresentationModal.types";

const getNextStage = (currentStage: IssueCredentialStage) => {
  if (
    [
      IssueCredentialStage.SelectConnection,
      IssueCredentialStage.SelectCredentialType,
    ].includes(currentStage)
  )
    return IssueCredentialStage.InputAttribute;
  if (currentStage === IssueCredentialStage.InputAttribute)
    return IssueCredentialStage.Review;
  return null;
};

const getBackStage = (
  currentStage: IssueCredentialStage,
  hasDefaultConnection: boolean
) => {
  if (currentStage === IssueCredentialStage.Review)
    return IssueCredentialStage.InputAttribute;
  if (currentStage === IssueCredentialStage.InputAttribute)
    return hasDefaultConnection
      ? IssueCredentialStage.SelectCredentialType
      : IssueCredentialStage.SelectConnection;
};

export { getBackStage, getNextStage };
