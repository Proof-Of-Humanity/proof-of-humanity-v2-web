import { NextRequest, NextResponse } from 'next/server';
import { Blob, File, FilebaseClient } from '@filebase/client';
import logtail from 'config/logtail';

const PARENT_NAME_KEY = '###';
const PARENT_FILETYPE = 'application/json';

const filebase = new FilebaseClient({ token: process.env.FILEBASE_TOKEN });

const pinToFilebase = async (data: globalThis.FormData) => {
  let uri = '';
  let fileCount = 0;
  let hasField = false;
  const parent: { [key: string]: string } = {};

  for (const [key, dataElement] of data.entries()) {
    if (typeof dataElement === 'string') {
      if (key !== PARENT_NAME_KEY) parent[key] = dataElement;
      hasField = true;
    } else {
      uri = await filebase.storeBlob(dataElement);
      parent[key] = `/ipfs/${uri}`;
      fileCount++;
    }
  }

  if (hasField || fileCount > 1) {
    const name = (data.get(PARENT_NAME_KEY) as string) || undefined;

    if (name) {
      uri = await filebase.storeDirectory([
        new File([JSON.stringify(parent)], name, { type: PARENT_FILETYPE }),
      ]);
      uri += '/' + name;
    } else {
      uri = await filebase.storeBlob(new Blob([JSON.stringify(parent)], { type: PARENT_FILETYPE }));
    }
  }

  return `/ipfs/${uri}`;
};

export async function POST(request: NextRequest) {
  try {
    logtail.info('pohv2 ipfs-upload', request);
    if (!request.formData) {
      logtail.error('pohv2 ipfs-upload weird form data', request.formData);
      throw new Error('weird form data');
    }
    const formData = await request.formData();
    const uri = await pinToFilebase(formData);
    return NextResponse.json({ uri });
  } catch (err: any) {
    logtail.error('pohv2 ipfs-upload', { err });
    await logtail.flush();
    return NextResponse.error();
  }
}
