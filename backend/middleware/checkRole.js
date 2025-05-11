const checkRole = (allwedRole) => {
  return (req, res, next) => {
    const userRole = req.userRole;
    console.log(userRole);

    // check

    if (!allwedRole.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - you don't have permisstion to perfom this action",
      });
    }
    next();
  };
};

module.exports = checkRole;
