import React from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { Icon } from '@blueprintjs/core';
import { FormattedNumber, FormattedMessage } from 'react-intl';

import { Collection } from 'src/components/common';
import getPath from 'src/util/getPath';
import { selectCollectionXrefIndex } from "src/selectors";

import './CollectionXrefIndexMode.scss';


class CollectionXrefIndexMode extends React.Component {
  render() {
    const { collection, xrefIndex } = this.props;
    if (xrefIndex.results === undefined || xrefIndex.total === undefined) {
      return null;
    }

    const linkPath = getPath(collection.links.ui) + '/xref/';
    const csvPath = collection.links.xref_csv;
    return (
      <section className="CollectionXrefTable">
        <table className="data-table">
          <thead>
            <tr>
              <th className='entity'>
                <span className="value">
                  <FormattedMessage id="xref.collection"
                                    defaultMessage="Cross-referenced collection" />
                </span>
              </th>
              <th className="numeric">
                <span className="value">
                  <FormattedMessage id="xref.matches"
                                    defaultMessage="Matches" />
                </span>
              </th>
            </tr>
            <tr>
              <th colSpan={2}>
                {xrefIndex.total && (
                  <a href={csvPath} download>
                    <Icon icon="download" />
                    <FormattedMessage id="xref.download"
                                      defaultMessage="Download matches as CSV" />
                  </a>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
          {xrefIndex.results.map((xref) => (
            <tr key={xref.collection.id}>
              <td className="entity">
                <Link to={`${linkPath}${xref.collection.id}`}>
                  <Collection.Label collection={xref.collection} />
                </Link>
              </td>
              <td className="numeric">
                <FormattedNumber value={xref.matches} />
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </section>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { collection } = ownProps;
  return { 
    xrefIndex: selectCollectionXrefIndex(state, collection.id)
  };
};

CollectionXrefIndexMode = connect(mapStateToProps, {})(CollectionXrefIndexMode);
CollectionXrefIndexMode = withRouter(CollectionXrefIndexMode);
export default CollectionXrefIndexMode  ;
