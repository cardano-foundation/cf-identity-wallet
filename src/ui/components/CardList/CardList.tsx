import {
  IonIcon,
  IonItem,
  IonItemOptions,
  IonItemSliding,
  IonList,
} from "@ionic/react";
import { personCircleOutline } from "ionicons/icons";
import { CardItemProps, CardListProps } from "./CardList.types";
import "./CardList.scss";
import { combineClassNames } from "../../utils/style";

const CardInfo = <T extends object = object>({
  card,
  onCardClick,
  onRenderEndSlot,
}: CardItemProps<T>) => {
  const titleClass = combineClassNames("card-title", {
    "no-margin": !card.subtitle,
  });

  const cardImg = card.image ? (
    <img
      src={card.image}
      alt={card.title}
      className="card-logo"
      data-testid="card-logo"
    />
  ) : (
    <div
      data-testid="card-fallback-logo"
      className="card-fallback-logo card-logo"
    >
      <IonIcon
        icon={personCircleOutline}
        color="light"
      />
    </div>
  );

  return (
    <IonItem
      onClick={(e) => onCardClick?.(card.data, e)}
      data-testid={`card-item-${card.id}`}
      className="card-item"
    >
      {cardImg}
      <div className="card-info">
        <p
          data-testid={`card-title-${card.id}`}
          className={titleClass}
        >
          {card.title}
        </p>
        {card.subtitle && (
          <p
            data-testid={`card-subtitle-${card.id}`}
            className="card-subtitle"
          >
            {card.subtitle}
          </p>
        )}
      </div>
      {onRenderEndSlot?.(card.data)}
    </IonItem>
  );
};

const CardItem = <T extends object = object>({
  card,
  onCardClick,
  onRenderCardAction,
  onRenderEndSlot,
}: CardItemProps<T>) => {
  if (!onRenderCardAction) {
    return (
      <CardInfo
        card={card}
        onCardClick={onCardClick}
        onRenderEndSlot={onRenderEndSlot}
      />
    );
  }

  return (
    <IonItemSliding>
      <CardInfo
        card={card}
        onCardClick={onCardClick}
        onRenderEndSlot={onRenderEndSlot}
      />
      <IonItemOptions data-testid="card-actions">
        {onRenderCardAction(card.data)}
      </IonItemOptions>
    </IonItemSliding>
  );
};

const CardList = <T extends object = object>({
  data,
  className,
  lines,
  rounded = true,
  testId,
  onRenderCardAction,
  onCardClick,
  onRenderEndSlot,
}: CardListProps<T>) => {
  const classes = combineClassNames("card-list", className, {
    "rounde-img": rounded,
  });

  return (
    <IonList
      lines={lines}
      data-testid={testId}
      className={classes}
    >
      {data.map((card) => (
        <CardItem
          card={card}
          key={card.id}
          onCardClick={onCardClick}
          onRenderCardAction={onRenderCardAction}
          onRenderEndSlot={onRenderEndSlot}
        />
      ))}
    </IonList>
  );
};

export { CardList };
