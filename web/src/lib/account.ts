import { Types } from "mongoose";
import { connectToDatabase } from "./db";
import UserModel from "@/models/User";
import PredictionModel from "@/models/Prediction";
import GroupMembershipModel from "@/models/GroupMembership";
import LeagueMembershipModel from "@/models/LeagueMembership";

// Los Group que el usuario haya creado (Group.ownerId) se dejan intactos a propósito:
// un grupo de amigos no debería desaparecer para el resto solo porque quien lo creó
// borró su cuenta. ownerId no se usa hoy para ningún permiso especial (ver lib/groups.ts:
// no hay roles ni aprobación), así que dejarlo apuntando a un usuario borrado no rompe nada.
export async function deleteAccount(userId: Types.ObjectId | string) {
  await connectToDatabase();
  await PredictionModel.deleteMany({ userId });
  await GroupMembershipModel.deleteMany({ userId });
  await LeagueMembershipModel.deleteMany({ userId });
  await UserModel.findByIdAndDelete(userId);
}
