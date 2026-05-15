"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { warmVideoPipeline } from "utils/media.video.pipeline";
import type { FormProps } from "./Form";
import FormSkeleton from "./FormSkeleton";

const Form = dynamic(() => import("./Form"), {
  ssr: false,
  loading: () => <FormSkeleton />,
});

export default function FormLoader(props: FormProps) {
  useEffect(() => {
    warmVideoPipeline();
  }, []);

  return <Form {...props} />;
}
