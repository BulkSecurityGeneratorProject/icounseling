import React from 'react';
import {connect} from 'react-redux';
import {Link, RouteComponentProps} from 'react-router-dom';
import {Button, Col, Label, Row} from 'reactstrap';
import {AvForm, AvGroup, AvInput} from 'availity-reactstrap-validation';
// tslint:disable-next-line:no-unused-variable
import {Translate, translate} from 'react-jhipster';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {IRootState} from 'app/shared/reducers';
import {getEntities as getTasks} from 'app/entities/task/task.reducer';
import {createEntity, getEntity, reset, updateEntity} from './reminder.reducer';
// tslint:disable-next-line:no-unused-variable
import {convertDateTimeFromServer, convertDateTimeToServer} from 'app/shared/util/date-utils';

export interface IReminderUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {
}

export interface IReminderUpdateState {
  isNew: boolean;
  taskId: string;
}

export class ReminderUpdate extends React.Component<IReminderUpdateProps, IReminderUpdateState> {
  constructor(props) {
    super(props);
    this.state = {
      taskId: '0',
      isNew: !this.props.match.params || !this.props.match.params.id
    };
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.updateSuccess !== this.props.updateSuccess && nextProps.updateSuccess) {
      this.handleClose();
    }
  }

  componentDidMount() {
    if (this.state.isNew) {
      this.props.reset();
    } else {
      this.props.getEntity(this.props.match.params.id);
    }

    this.props.getTasks();
  }

  saveEntity = (event, errors, values) => {
    values.dateTime = convertDateTimeToServer(values.dateTime);

    if (errors.length === 0) {
      const {reminderEntity} = this.props;
      const entity = {
        ...reminderEntity,
        ...values
      };

      if (this.state.isNew) {
        this.props.createEntity(entity);
      } else {
        this.props.updateEntity(entity);
      }
    }
  };

  handleClose = () => {
    this.props.history.push('/entity/reminder');
  };

  render() {
    const {reminderEntity, tasks, loading, updating} = this.props;
    const {isNew} = this.state;

    return (
      <div>
        <Row className="justify-content-center">
          <Col md="8">
            <h2 id="iCounselingApp.reminder.home.createOrEditLabel">
              <Translate contentKey="iCounselingApp.reminder.home.createOrEditLabel">Create or edit a
                Reminder</Translate>
            </h2>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md="8">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <AvForm model={isNew ? {} : reminderEntity} onSubmit={this.saveEntity}>
                {!isNew ? (
                  <AvGroup>
                    <Label for="reminder-id">
                      <Translate contentKey="global.field.id">ID</Translate>
                    </Label>
                    <AvInput id="reminder-id" type="text" className="form-control" name="id" required readOnly/>
                  </AvGroup>
                ) : null}
                <AvGroup>
                  <Label id="dateTimeLabel" for="reminder-dateTime">
                    <Translate contentKey="iCounselingApp.reminder.dateTime">Date Time</Translate>
                  </Label>
                  <AvInput
                    id="reminder-dateTime"
                    type="datetime-local"
                    className="form-control"
                    name="dateTime"
                    placeholder={'YYYY-MM-DD HH:mm'}
                    value={isNew ? null : convertDateTimeFromServer(this.props.reminderEntity.dateTime)}
                    validate={{
                      required: {value: true, errorMessage: translate('entity.validation.required')}
                    }}
                  />
                </AvGroup>
                <Button tag={Link} id="cancel-save" to="/entity/reminder" replace color="info">
                  <FontAwesomeIcon icon="arrow-left"/>
                  &nbsp;
                  <span className="d-none d-md-inline">
                    <Translate contentKey="entity.action.back">Back</Translate>
                  </span>
                </Button>
                &nbsp;
                <Button color="primary" id="save-entity" type="submit" disabled={updating}>
                  <FontAwesomeIcon icon="save"/>
                  &nbsp;
                  <Translate contentKey="entity.action.save">Save</Translate>
                </Button>
              </AvForm>
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (storeState: IRootState) => ({
  tasks: storeState.task.entities,
  reminderEntity: storeState.reminder.entity,
  loading: storeState.reminder.loading,
  updating: storeState.reminder.updating,
  updateSuccess: storeState.reminder.updateSuccess
});

const mapDispatchToProps = {
  getTasks,
  getEntity,
  updateEntity,
  createEntity,
  reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReminderUpdate);
