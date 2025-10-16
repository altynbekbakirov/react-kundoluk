import { ChannelModel } from "./ChannelModel";
import { SchoolModel } from "./SchoolModel";

export type LoginModel = {
    userId?: string;
    studentId?: string;
    okpo?: string;
    pin?: number;
    grade?: number;
    letter?: string;
    type?: string;
    lastName?: string;
    firstName?: string;
    middleName?: string;
    email?: string;
    phone?: string;
    locale?: string;
    token?: string;
    refresh?: string;
    changePassword?: boolean;
    isClassManager?: boolean;
    userTypename?: string;
    school?: SchoolModel;
    schools?: SchoolModel [];
    // students?: StudentModel[];
    birthDate?: Date;
    channels?: ChannelModel[];
    isUserAgreementSigned?: boolean;
}