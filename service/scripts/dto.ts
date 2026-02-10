import { Script } from "@/types/service";
import { tokenProps } from "@/types/token";

export interface GetScriptsProps extends tokenProps {
  serviceTypeId?: string;
}

export interface DeleteScriptsProps extends tokenProps {
  id: string;
  item: Script;
}

export interface CreateScriptProps extends tokenProps {
  name: string;
  status: boolean;
  serviceTypeId: string;
  scriptItems?:
    | {
        question: string;
      }[]
    | undefined;
}

export interface UpdateScriptProps extends tokenProps {
  name: string;
  status: boolean;
  scriptItems?:
    | {
        question: string;
      }[]
    | undefined;
  scriptId: string;
}
