import React from 'react';
import {connect} from 'react-redux';
import {Link, RouteComponentProps} from 'react-router-dom';
import {Button, Col, Row} from 'reactstrap';
// tslint:disable-next-line:no-unused-variable
import {TextFormat, Translate} from 'react-jhipster';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {IRootState} from 'app/shared/reducers';
import {getEntity} from './job-history.reducer';
// tslint:disable-next-line:no-unused-variable
import {APP_DATE_FORMAT} from 'app/config/constants';

export interface IJobHistoryDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {
}

export class JobHistoryDetail extends React.Component<IJobHistoryDetailProps> {
  componentDidMount() {
    this.props.getEntity(this.props.match.params.id);
  }

  render() {
    const {jobHistoryEntity} = this.props;
    return (
      <Row>
        <Col md="8">
          <h2>
            <Translate
              contentKey="iCounselingApp.jobHistory.detail.title">JobHistory</Translate> [<b>{jobHistoryEntity.id}</b>]
          </h2>
          <dl className="jh-entity-details">
            <dt>
              <span id="startDate">
                <Translate contentKey="iCounselingApp.jobHistory.startDate">Start Date</Translate>
              </span>
            </dt>
            <dd>
              <TextFormat value={jobHistoryEntity.startDate} type="date" format={APP_DATE_FORMAT}/>
            </dd>
            <dt>
              <span id="endDate">
                <Translate contentKey="iCounselingApp.jobHistory.endDate">End Date</Translate>
              </span>
            </dt>
            <dd>
              <TextFormat value={jobHistoryEntity.endDate} type="date" format={APP_DATE_FORMAT}/>
            </dd>
            <dt>
              <Translate contentKey="iCounselingApp.jobHistory.job">Job</Translate>
            </dt>
            <dd>{jobHistoryEntity.jobId ? jobHistoryEntity.jobId : ''}</dd>
          </dl>
          <Button tag={Link} to="/entity/job-history" replace color="info">
            <FontAwesomeIcon icon="arrow-left"/>{' '}
            <span className="d-none d-md-inline">
              <Translate contentKey="entity.action.back">Back</Translate>
            </span>
          </Button>
          &nbsp;
          <Button tag={Link} to={`/entity/job-history/${jobHistoryEntity.id}/edit`} replace color="primary">
            <FontAwesomeIcon icon="pencil-alt"/>{' '}
            <span className="d-none d-md-inline">
              <Translate contentKey="entity.action.edit">Edit</Translate>
            </span>
          </Button>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = ({jobHistory}: IRootState) => ({
  jobHistoryEntity: jobHistory.entity
});

const mapDispatchToProps = {getEntity};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JobHistoryDetail);