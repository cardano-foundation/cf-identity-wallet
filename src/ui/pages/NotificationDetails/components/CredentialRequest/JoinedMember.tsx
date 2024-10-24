import { JoinedMemberProps } from "./CredentialRequest.types";
import KeriLogo from "../../../../assets/images/KeriGeneric.jpg";

const MAX_DISPLAY_MEMBERS = 2;
const JoinedMember = ({ members, onClick }: JoinedMemberProps) => {
  if (!members || members.length === 0) return null;

  return (
    <div
      className="joined-member"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      data-testid="joined-member"
    >
      {members.map((member, index) => {
        if (index < MAX_DISPLAY_MEMBERS) {
          return (
            <img
              style={{
                marginLeft: index > 0 ? "-0.45rem" : undefined,
              }}
              key={member.aid}
              className="member"
              src={KeriLogo}
              alt={member.name}
            />
          );
        }

        if (index > MAX_DISPLAY_MEMBERS) {
          return null;
        }

        return (
          <div
            key={member.aid}
            className="member additional-members"
          >
            +{members.length - MAX_DISPLAY_MEMBERS}
          </div>
        );
      })}
    </div>
  );
};

export { JoinedMember };
