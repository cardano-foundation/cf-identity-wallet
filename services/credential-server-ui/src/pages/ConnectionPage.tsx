import React, { useEffect, useState } from "react";
import GetQRButton from "../components/GetQRButton";
import { config } from "../config";
import { Button, Divider, Grid, Typography } from "@mui/material";
import GetInputButton from "../components/inputOOBI/GetInputButton";
import GetScannerButton from "../components/inputOOBI/GetScannerButton";
import axios from "axios";
import { Contact } from "../types.types";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DeleteOutline } from "@mui/icons-material";
import { UUID_REGEX } from "../constants";

const ConnectionPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    handleGetContacts();
  }, []);

  const handleGetContacts = async () => {
    console.log("get")
    setContacts(
      (await axios.get(`${config.endpoint}${config.path.contacts}`)).data.data
    );
  };

  const handleDeleteContact = async (id: string) => {
    await axios.delete(`${config.endpoint}${config.path.deleteContact}?id=${id}`)
    await handleGetContacts();
  }

  return (
    <>
      <Typography component="h1" variant="h4" align="center">
        Connect
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} md={12}>
          <Divider />
          <GetQRButton
            name=""
            url={`${config.endpoint}${config.path.keriOobi}`}
            onQRGenerated={() => { }}
          />
          <Divider />
          <GetScannerButton />
          <Divider />
          <GetInputButton handleGetContacts={()=> handleGetContacts()}/>
          <Divider />
        </Grid>
      </Grid>

      <Typography component="h1" variant="h4" align="center">
        Mange connections
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleGetContacts}
        ></Button>
      </Typography>
      <br></br>
      <Grid container spacing={2} justifyContent="center">
        {contacts.map(contact => (
          <Grid container xs={10} spacing={2}>
            <Grid item xs={10} textAlign={"left"}>
              {UUID_REGEX.test(contact.alias) ? "" : contact.alias} ({contact.id.slice(0, 4)}...{contact.id.slice(-4)})
            </Grid>
            <Grid item xs={2}>
              <Button
                startIcon={<DeleteOutline />}
                onClick={() => handleDeleteContact(contact.id)}
                style={{ height: "100%" }}
              ></Button>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default ConnectionPage;
