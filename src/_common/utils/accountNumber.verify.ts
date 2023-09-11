export const accountNumberVerify = (time, findAccount): boolean => {
  if (!findAccount) return false;

  return time !==
    `${String(findAccount.createdAt.getUTCHours()).padStart(2, '0')}${String(findAccount.createdAt.getUTCMinutes()).padStart(2, '0')}${String(
      findAccount.createdAt.getUTCSeconds(),
    ).padStart(2, '0')}`
    ? false
    : true;
};
