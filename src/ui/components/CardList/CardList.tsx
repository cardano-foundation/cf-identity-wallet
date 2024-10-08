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
  onRenderStartSlot: renderStartSlot,
}: CardItemProps<T>) => {
  const titleClass = combineClassNames("card-title", {
    "has-subtitle": !!card.subtitle,
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
      {renderStartSlot?.(card.data)}
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
  onRenderStartSlot: renderStartSlot,
}: CardItemProps<T>) => {
  if (!onRenderCardAction) {
    return (
      <CardInfo
        card={card}
        onCardClick={onCardClick}
        onRenderEndSlot={onRenderEndSlot}
        onRenderStartSlot={renderStartSlot}
      />
    );
  }

  return (
    <IonItemSliding>
      <CardInfo
        card={card}
        onCardClick={onCardClick}
        onRenderEndSlot={onRenderEndSlot}
        onRenderStartSlot={renderStartSlot}
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
  onRenderStartSlot: renderStartSlot,
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
          onRenderStartSlot={renderStartSlot}
        />
      ))}
    </IonList>
  );
};

export { CardList };
