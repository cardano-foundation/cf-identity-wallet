import { Request, Response } from "express";

function ping(_: Request, res: Response) {
  res.status(200).send("pong");
}

export { ping };
