const { notarize } = require("@electron/notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") return;

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log(`Notarizing ${appPath}...`);

  await notarize({
    tool: "notarytool",
    appPath,
    appleId: "sthayes.02@icloud.com",
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: "2MA3366SP7",
  });

  console.log("Notarization complete.");
};
