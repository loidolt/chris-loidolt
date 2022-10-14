import React from 'react';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTheme, TextField, Paper, Grid, Typography } from "@mui/material";
import { LoadingButton } from '@mui/lab';
//firebase
import { saveDocumentGenerateID } from '../utils/firestore';

import { Layout, Seo } from "../components/layout";

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email("Please enter a valid email address").required('Email is required'),
  message: yup.string().required('Message is required'),
});

export default function Contact() {
  const theme = useTheme();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    }
  });

  const onSubmit = async (data) => {
    console.log(data)
    const message = {
      to: 'loidolt@gmail.com',
      replyTo: `${data.email}`,
      message: {
        subject: `${data.name} | Loidolt Design Contact Form`,
        text: `${data.message}`,
        html: `${data.message}`,
      }
    }
    const response = await saveDocumentGenerateID("mail", message)
    if (response) {
      reset();
    }
  };

  return (
    <Layout>
      <Typography variant="h3" component="h1" gutterBottom>
        Contact
      </Typography>
      <Paper
        sx={{
          padding: 4,
          backgroundColor: theme.palette.background.paper,
          borderRadius: "20px",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" name="form-name" value="contact" />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                id="name"
                name="name"
                control={control}
                {...register("name", { required: true })}
                render={({ field }) =>
                  <TextField
                    {...field}
                    label="Name"
                    margin="dense"
                    fullWidth
                    error={Boolean(errors.name?.message)}
                    helperText={errors.name?.message}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                id="email"
                name="email"
                control={control}
                {...register("email", { required: true })}
                render={({ field }) =>
                  <TextField
                    {...field}
                    label="Email"
                    margin="dense"
                    fullWidth
                    error={Boolean(errors.email?.message)}
                    helperText={errors.email?.message}
                  />
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                id="message"
                name="message"
                control={control}
                {...register("message", { required: true })}
                render={({ field }) =>
                  <TextField
                    {...field}
                    label="Message"
                    margin="dense"
                    fullWidth
                    multiline
                    rows={6}
                    error={Boolean(errors.message?.message)}
                    helperText={errors.message?.message}
                  />
                }
              />
            </Grid>
            <Grid item xs={12}>
              <LoadingButton size="large" type="submit" variant="contained" loading={isSubmitting}>
                Submit
              </LoadingButton>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Layout>
  );
};

export const Head = () => (
  <Seo title="Contact" />
)