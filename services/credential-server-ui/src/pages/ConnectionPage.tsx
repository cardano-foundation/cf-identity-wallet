import React, { useEffect, useState } from "react";
import GetQRButton from "../components/GetQRButton";
import { config } from "../config";
import { Button, Divider, Grid, Input, Paper, Typography } from "@mui/material";
import GetInputButton from "../components/inputOOBI/GetInputButton";
import GetScannerButton from "../components/inputOOBI/GetScannerButton";
import axios from "axios";
import { Contact } from "../types.types";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DeleteOutline } from "@mui/icons-material";
import { UUID_REGEX } from "../constants";

const ConnectionPage: React.FC = () => {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [connectionsFilter, setConnectionsFilter] = useState<string>("");

  useEffect(() => {
    handleGetContacts();
  }, []);

  useEffect(() => {
    const regex = new RegExp(connectionsFilter, "gi");
    setContacts(allContacts.filter((contact: { alias: string; id: string }) => regex.test(contact.alias) || regex.test(contact.id)));
  }, [connectionsFilter]);

  const handleGetContacts = async () => {
    const contactsList = (await axios.get(`${config.endpoint}${config.path.contacts}`)).data.data;
    setContacts(contactsList);
    setAllContacts(contactsList);
  };

  const handleDeleteContact = async (id: string) => {
    await axios.delete(`${config.endpoint}${config.path.deleteContact}?id=${id}`)
    await handleGetContacts();
  }

  return (
    <>
      <Paper variant="outlined"
            sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Typography component="h1" variant="h4" align="center">
          Connect
        </Typography>
        <Grid container justifyContent="center">
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
      </Paper>
      
      <Paper variant="outlined"
            sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Typography component="h1" variant="h4" align="center">
          Manage connections
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleGetContacts}
          ></Button>
          <br></br>
          <Input onChange={(event) => setConnectionsFilter(event.target.value)} placeholder="Search for connections"/>
          <br></br>
          <Divider />
        </Typography>
        <br></br>
        <Grid container justifyContent="center">
          {contacts.map(contact => (
            <Grid container xs={10}>
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
      </Paper>

    </>
  );
};

export default ConnectionPage;
