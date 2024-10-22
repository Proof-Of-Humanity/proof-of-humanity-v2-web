import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
logtail.use(async (log: any) => ({ ...log, process: __filename }));

export default logtail;
