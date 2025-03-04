export type Data = {
  id: number;
  name: string;
  date: string;
  credentials: number;
};

const createData = (
  id: number,
  name: string,
  date: string,
  credentials: number
): Data => {
  return {
    id,
    name,
    date,
    credentials,
  };
};

const rows = [
  createData(1, "Alice", "2020-03-15T12:34:56Z", 3),
  createData(2, "Bob", "2021-06-21T08:45:30Z", 25),
  createData(3, "Charlie", "2022-11-05T14:22:10Z", 16),
  createData(4, "David", "2023-01-19T09:15:45Z", 6),
  createData(5, "Eve", "2024-07-30T16:50:00Z", 16),
  createData(6, "Frank", "2020-09-10T11:05:20Z", 3),
  createData(7, "Grace", "2021-12-25T18:30:40Z", 9),
  createData(8, "Hannah", "2022-04-14T07:55:15Z", 10),
  createData(9, "Ivy", "2023-08-08T13:40:25Z", 26),
  createData(10, "Jack", "2024-02-28T20:10:35Z", 2),
  createData(11, "Kathy", "2020-05-17T10:20:30Z", 6),
  createData(12, "Leo", "2021-10-03T15:45:50Z", 19),
  createData(13, "Mona", "2022-06-22T19:05:05Z", 18),
];

export { createData, rows };
