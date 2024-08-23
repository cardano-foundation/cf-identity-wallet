import { forwardRef, useImperativeHandle } from "react";
import { ProfileOptionRef, ProfileProps } from "./Profile.types";

const Profile = forwardRef<ProfileOptionRef, ProfileProps>(
  ({ isEditing }, ref) => {
    const saveChanges = () => {
      console.log("saved");
    };
    useImperativeHandle(ref, () => ({
      saveChanges: saveChanges,
    }));
    return (
      <div>
        <p>{isEditing ? "Edit mode" : "Read only"}</p>
      </div>
    );
  }
);

export { Profile };
