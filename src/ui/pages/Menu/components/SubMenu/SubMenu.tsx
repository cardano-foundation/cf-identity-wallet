import { arrowBackOutline } from "ionicons/icons";
import "./SubMenu.scss";
import { SubMenuProps } from "./SubMenu.types";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../../../components/PageHeader";
import { combineClassNames } from "../../../../utils/style";

const SubMenu = ({
  showSubMenu,
  setShowSubMenu,
  title,
  additionalButtons,
  children,
  pageId: customPageId,
}: SubMenuProps) => {
  const pageId = `sub-menu ${customPageId}`;
  const classes = combineClassNames({
    show: showSubMenu,
    hide: !showSubMenu,
  });

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
      customClass={classes}
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
