import React, { useEffect, useState } from "react";
import ConnectionQR from "../components/ConnectionQR";
import { config } from "../config";
import { Button, Divider, Grid, Input, Paper, Typography } from "@mui/material";
import { InputOobi } from "../components/inputOOBI/InputOobi";
import axios from "axios";
import { Contact } from "../types";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DeleteOutline } from "@mui/icons-material";
import { UUID_REGEX } from "../constants";
import Toast from "../components/Toast";

const ConnectionPage: React.FC = () => {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [connectionsFilter, setConnectionsFilter] = useState<string>("");
  const [step, setStep] = useState<number>(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("error");

  useEffect(() => {
    handleGetContacts();
  }, []);

  useEffect(() => {
    const regex = new RegExp(connectionsFilter, "gi");
    setContacts(
      allContacts.filter(
        (contact: { alias: string; id: string }) =>
          regex.test(contact.alias) || regex.test(contact.id)
      )
    );
  }, [connectionsFilter]);

  const handleGetContacts = async () => {
    try {
      const contactsList = (
        await axios.get(`${config.endpoint}${config.path.contacts}`)
      ).data.data;
      setContacts(contactsList);
      setAllContacts(contactsList);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setToastMessage("It was not possible to connect to the backend server");
      setToastSeverity("error");
      setToastVisible(true);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await axios.delete(
        `${config.endpoint}${config.path.deleteContact}?id=${id}`
      );
      handleGetContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
      setToastMessage("It was not possible to delete the contact");
      setToastSeverity("error");
      setToastVisible(true);
    }
  };

  const handleCloseToast = () => {
    setToastVisible(false);
  };

  return (
    <div>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Typography
          component="h1"
          variant="h4"
          align="center"
        >
          Connect
        </Typography>
        <Grid
          container
          justifyContent="center"
        >
          <Grid
            item
            xs={12}
            md={12}
          >
            {step === 0 && (
              <>
                <Divider />
                <ConnectionQR
                  name=""
                  url={`${config.endpoint}${config.path.keriOobi}`}
                  onNextStep={() => setStep(1)}
                />
              </>
            )}
            {step === 1 && (
              <>
                <Divider />
                <InputOobi
                  backToFirstStep={() => setStep(0)}
                  handleGetContacts={() => handleGetContacts()}
                />
              </>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Typography
          component="h1"
          variant="h4"
          align="center"
        >
          Manage connections
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleGetContacts}
          ></Button>
        </Typography>
        <Divider />

        <Grid
          container
          justifyContent={"center"}
        >
          <Grid
            item
            xs={10}
            sx={{ display: "flex", justifyContent: "left", my: { md: 1 } }}
          >
            <Input
              fullWidth
              onChange={(event) => setConnectionsFilter(event.target.value)}
              placeholder="Search for connections"
            />
            <br></br>
          </Grid>
        </Grid>
        <Grid
          container
          justifyContent="center"
        >
          {contacts.map((contact) => (
            <Grid
              container
              xs={10}
              sx={{ my: { md: 1 } }}
              key={contact.id}
            >
              <Grid
                item
                xs={10}
                textAlign={"left"}
              >
                {UUID_REGEX.test(contact.alias) ? "" : contact.alias} (
                {contact.id.slice(0, 4)}...{contact.id.slice(-4)})
              </Grid>
              <Grid
                item
                xs={2}
              >
                <Button
                  startIcon={<DeleteOutline />}
                  onClick={() => handleDeleteContact(contact.id)}
                  style={{ height: "100%" }}
                ></Button>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Paper>
      <Toast
        message={toastMessage}
        severity={toastSeverity}
        visible={toastVisible}
        onClose={handleCloseToast}
      />
    </div>
  );
};

export { ConnectionPage };
