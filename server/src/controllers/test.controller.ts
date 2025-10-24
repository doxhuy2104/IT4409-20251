import { Request, Response } from "express";

// Controller for GET request
export const getTest = (req: Request, res: Response): void => {
  res.status(200).json({
    message: "GET request successful!",
    data: { status: "ok" },
  });
};

// Controller for POST request
export const postTest = (req: Request, res: Response): void => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }

  res.status(201).json({
    message: "POST request successful!",
    receivedData: { name },
  });
};
