import { arrowBackOutline } from "ionicons/icons";
import { PageHeader } from "../../../components/PageHeader";
import { ScrollablePageLayout } from "../../../components/layout/ScrollablePageLayout";
import "./SubMenu.scss";
import { SubMenuProps } from "../../Menu/Menu.types";

const SubMenu = ({
  showSubMenu,
  setShowSubMenu,
  title,
  additionalButtons,
  children,
}: SubMenuProps) => {
  const pageId = "sub-menu";

  return (
    <ScrollablePageLayout
      pageId={pageId}
      activeStatus={showSubMenu}
      header={
        <PageHeader
          closeButton={true}
          closeButtonAction={() => setShowSubMenu(false)}
          closeButtonIcon={arrowBackOutline}
          title={title}
          additionalButtons={additionalButtons}
        />
      }
      customClass={`${showSubMenu ? "show" : "hide"}`}
    >
      <div
        className={`${title?.toLowerCase().replace(" ", "-")}-content`}
        data-testid={`${title?.toLowerCase().replace(" ", "-")}-content`}
      >
        {children}
      </div>
    </ScrollablePageLayout>
  );
};

export { SubMenu };
