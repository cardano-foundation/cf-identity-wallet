import { Trans } from "react-i18next";
import { i18n } from "../../i18n";
import { PopupModal } from "../PopupModal";
import {
  IssueCredentialModalProps,
  IssueCredentialStage,
} from "./IssueCredentialModal.types";
import { useEffect, useMemo, useState } from "react";
import { Box, Button } from "@mui/material";
import { getBackStage, getNextStage } from "./helper";
import "./IssueCredentialModal.scss";
import { SelectConnectionStage } from "./SelectConnectionStage";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { InputAttribute } from "./InputAttribute";
import { Review } from "./Review";
import { SchemaAID } from "../../const";
import { CredentialService } from "../../services";
import { enqueueSnackbar, VariantType } from "notistack";
import { fetchContactCredentials } from "../../store/reducers/connectionsSlice";

const IssueCredentialModal = ({
  open,
  onClose,
  credentialType,
  connectionId,
}: IssueCredentialModalProps) => {
  const initStage =
    credentialType && connectionId
      ? IssueCredentialStage.InputAttribute
      : credentialType
        ? IssueCredentialStage.SelectConnection
        : IssueCredentialStage.SelectCredentialType;
  const connections = useAppSelector((state) => state.connections.contacts);
  const dispatch = useAppDispatch();

  const [currentStage, setCurrentStage] = useState(initStage);
  const [connection, setConnection] = useState(connectionId);
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const triggerToast = (message: string, variant: VariantType) => {
    enqueueSnackbar(message, {
      variant,
      anchorOrigin: { vertical: "top", horizontal: "center" },
    });
  };
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stage =
      credentialType && connectionId
        ? IssueCredentialStage.InputAttribute
        : credentialType
          ? IssueCredentialStage.SelectConnection
          : IssueCredentialStage.SelectCredentialType;
    setCurrentStage(stage);
    if (connectionId) return setConnection(connectionId);
  }, [connectionId, credentialType]);

  const resetModal = () => {
    onClose();
    setConnection(undefined);
    setAttributes({});
    setCurrentStage(initStage);
  };

  const description = useMemo(() => {
    switch (currentStage) {
      case IssueCredentialStage.InputAttribute:
        return "pages.credentialDetails.issueCredential.inputAttribute.description";
      case IssueCredentialStage.Review:
        return "pages.credentialDetails.issueCredential.review.description";
      case IssueCredentialStage.SelectConnection:
      default:
        return "pages.credentialDetails.issueCredential.selectConnection.description";
    }
  }, [currentStage]);

  const primaryButton = useMemo(() => {
    switch (currentStage) {
      case IssueCredentialStage.InputAttribute:
        return "pages.credentialDetails.issueCredential.inputAttribute.button.continue";
      case IssueCredentialStage.Review:
        return "pages.credentialDetails.issueCredential.review.button.issue";
      case IssueCredentialStage.SelectConnection:
      default:
        return "pages.credentialDetails.issueCredential.selectConnection.button.continue";
    }
  }, [currentStage]);

  const disablePrimaryButton = useMemo(() => {
    return (
      (currentStage === IssueCredentialStage.SelectConnection && !connection) ||
      (currentStage === IssueCredentialStage.InputAttribute &&
        Object.values(attributes).every((item) => !item)) ||
      loading
    );
  }, [attributes, connection, currentStage, loading]);

  const issueCred = async () => {
    if (!credentialType || !connection) {
      return;
    }

    const schemaSaid = SchemaAID[credentialType];
    let objAttributes = {};
    const attribute: Record<string, string> = {};

    Object.entries(attributes).forEach(([key, value]) => {
      if (key && value) attribute[key] = value;
    });

    if (Object.keys(attribute).length) {
      objAttributes = {
        attribute,
      };
    }

    const data = {
      schemaSaid: schemaSaid,
      aid: connection,
      ...objAttributes,
    };

    try {
      setLoading(true);
      await CredentialService.issue(data);
      triggerToast(
        i18n.t("pages.credentialDetails.issueCredential.messages.success"),
        "success"
      );
      dispatch(fetchContactCredentials(connection));
      resetModal();
    } catch (e) {
      triggerToast(
        i18n.t("pages.credentialDetails.issueCredential.messages.success"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderButton = () => {
    return (
      <Box className="footer">
        {[
          IssueCredentialStage.InputAttribute,
          IssueCredentialStage.Review,
        ].includes(currentStage) && (
          <Button
            variant="contained"
            className="neutral-button"
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={() => {
              setCurrentStage(
                getBackStage(currentStage, !credentialType) ||
                  IssueCredentialStage.SelectConnection
              );
            }}
          >
            {i18n.t("pages.credentialDetails.issueCredential.back")}
          </Button>
        )}
        <Button
          variant="contained"
          className="primary-button"
          disabled={disablePrimaryButton}
          onClick={() => {
            const nextStage = getNextStage(currentStage);
            if (nextStage) {
              setCurrentStage(nextStage);
              return;
            }

            issueCred();
          }}
        >
          {i18n.t(primaryButton)}
        </Button>
      </Box>
    );
  };

  const updateAttributes = (key: string, value: string) => {
    setAttributes((currentValue) => ({
      ...currentValue,
      [key]: value,
    }));
  };

  const renderStage = (currentStage: IssueCredentialStage) => {
    switch (currentStage) {
      case IssueCredentialStage.SelectConnection:
        return (
          <SelectConnectionStage
            onChange={setConnection}
            connections={connections}
            value={connection}
          />
        );
      case IssueCredentialStage.InputAttribute:
        return (
          <InputAttribute
            value={attributes}
            setValue={updateAttributes}
            credentialType={credentialType}
          />
        );
      case IssueCredentialStage.Review:
        return (
          <Review
            credentialType={credentialType}
            attribute={attributes}
            connectionId={connection}
            connections={connections}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PopupModal
      open={open}
      onClose={resetModal}
      title={i18n.t("pages.credentialDetails.issueCredential.title")}
      customClass={`issue-cred-modal stage-${currentStage}`}
      description={
        <Trans
          i18nKey={description}
          components={{ bold: <strong /> }}
        />
      }
      footer={renderButton()}
    >
      {renderStage(currentStage)}
    </PopupModal>
  );
};

export { IssueCredentialModal };
