import { arrowBackOutline } from "ionicons/icons";
import "./SubMenu.scss";
import { useCallback } from "react";
import { SubMenuProps } from "./SubMenu.types";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../../../components/PageHeader";
import { SideSlider } from "../../../../components/SideSlider";
import { SubMenuKey } from "../../Menu.types";

const SubMenu = ({
  showSubMenu,
  setShowSubMenu,
  switchView,
  nestedMenu,
  title,
  additionalButtons,
  children,
  pageId: customPageId,
  renderAsModal = true,
}: SubMenuProps) => {
  const pageId = `sub-menu ${customPageId}`;
  const handleClose = useCallback(() => {
    if (nestedMenu) {
      switchView(SubMenuKey.Settings);
    } else {
      setShowSubMenu(false);
    }
  }, [nestedMenu, setShowSubMenu, switchView]);

  return (
    <SideSlider
      renderAsModal={renderAsModal}
      isOpen={showSubMenu}
    >
      <ScrollablePageLayout
        pageId={pageId}
        activeStatus={showSubMenu}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={handleClose}
            closeButtonIcon={arrowBackOutline}
            title={title}
            additionalButtons={additionalButtons}
          />
        }
      >
        <div
          className={
            `${title?.toLowerCase().replace(" ", "-")}-content` +
            `${nestedMenu ? " nested-content" : ""}`
          }
          data-testid={`${title?.toLowerCase().replace(" ", "-")}-content`}
        >
          {children}
        </div>
      </ScrollablePageLayout>
    </SideSlider>
  );
};

export { SubMenu };
