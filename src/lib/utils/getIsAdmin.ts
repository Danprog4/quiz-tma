export const getIsAdmin = (userId: number) => {
  const admins = process.env.ADMINS?.split(",");
  return admins?.includes(userId.toString());
};
