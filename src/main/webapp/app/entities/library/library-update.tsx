import React from 'react';
import {connect} from 'react-redux';
import {Link, RouteComponentProps} from 'react-router-dom';
import {Button, Col, Label, Row} from 'reactstrap';
import {AvField, AvForm, AvGroup, AvInput} from 'availity-reactstrap-validation';
// tslint:disable-next-line:no-unused-variable
import {Translate, translate} from 'react-jhipster';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {IRootState} from 'app/shared/reducers';
import {getEntities as getVisitors} from 'app/entities/visitor/visitor.reducer';
import {createEntity, getEntity, reset, updateEntity} from './library.reducer';

// tslint:disable-next-line:no-unused-variable

export interface ILibraryUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {
}

export interface ILibraryUpdateState {
  isNew: boolean;
  visitorId: string;
}

export class LibraryUpdate extends React.Component<ILibraryUpdateProps, ILibraryUpdateState> {
  constructor(props) {
    super(props);
    this.state = {
      visitorId: '0',
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

    this.props.getVisitors();
  }

  saveEntity = (event, errors, values) => {
    if (errors.length === 0) {
      const {libraryEntity} = this.props;
      const entity = {
        ...libraryEntity,
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
    this.props.history.push('/entity/library');
  };

  render() {
    const {libraryEntity, visitors, loading, updating} = this.props;
    const {isNew} = this.state;

    return (
      <div>
        <Row className="justify-content-center">
          <Col md="8">
            <h2 id="iCounselingApp.library.home.createOrEditLabel">
              <Translate contentKey="iCounselingApp.library.home.createOrEditLabel">Create or edit a Library</Translate>
            </h2>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md="8">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <AvForm model={isNew ? {} : libraryEntity} onSubmit={this.saveEntity}>
                {!isNew ? (
                  <AvGroup>
                    <Label for="library-id">
                      <Translate contentKey="global.field.id">ID</Translate>
                    </Label>
                    <AvInput id="library-id" type="text" className="form-control" name="id" required readOnly/>
                  </AvGroup>
                ) : null}
                <AvGroup>
                  <Label id="nameLabel" for="library-name">
                    <Translate contentKey="iCounselingApp.library.name">Name</Translate>
                  </Label>
                  <AvField
                    id="library-name"
                    type="text"
                    name="name"
                    validate={{
                      required: {value: true, errorMessage: translate('entity.validation.required')}
                    }}
                  />
                </AvGroup>
                <AvGroup>
                  <Label id="creationTimeLabel" for="library-creationTime">
                    <Translate contentKey="iCounselingApp.library.creationTime">Creation Time</Translate>
                  </Label>
                  <AvField
                    id="library-creationTime"
                    type="date"
                    className="form-control"
                    name="creationTime"
                    validate={{
                      required: {value: true, errorMessage: translate('entity.validation.required')}
                    }}
                  />
                </AvGroup>
                <AvGroup>
                  <Label for="library-visitor">
                    <Translate contentKey="iCounselingApp.library.visitor">Visitor</Translate>
                  </Label>
                  <AvInput id="library-visitor" type="select" className="form-control" name="visitorId">
                    <option value="" key="0"/>
                    {visitors
                      ? visitors.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.id}
                        </option>
                      ))
                      : null}
                  </AvInput>
                </AvGroup>
                <Button tag={Link} id="cancel-save" to="/entity/library" replace color="info">
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
  visitors: storeState.visitor.entities,
  libraryEntity: storeState.library.entity,
  loading: storeState.library.loading,
  updating: storeState.library.updating,
  updateSuccess: storeState.library.updateSuccess
});

const mapDispatchToProps = {
  getVisitors,
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
)(LibraryUpdate);
